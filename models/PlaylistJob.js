const { Schema, model, Types } = require('mongoose');

const JOB_STATUSES = [
  'queued',
  'fetching_tracks',
  'fetching_features',
  'sorting',
  'creating_playlist',
  'completed',
  'failed',
];

const TRACK_STATUSES = [
  'pending',
  'in_progress',
  'ok',
  'missing',
  'failed',
];

const ALGORITHMS = ['dj', 'key', 'bpm'];

const TrackSchema = new Schema(
  {
    // Stable identifier you construct, e.g., "apple:catalog:1542568135"
    trackUid: { type: String, required: true },

    // Minimal Apple identifiers you might need later
    apple: {
      libraryId: { type: String }, // e.g., "a.1542568135"
      catalogId: { type: String }, // e.g., "1542568135"
      href: { type: String },
    },

    // Canonical metadata you care about
    title: { type: String, required: true },
    artist: { type: String, required: true },
    durationMs: { type: Number },

    // For caching/de-dup of analysis (artist+title+duration normalized)
    fingerprint: { type: String },

    // Filled in when analysis returns. Map "tempo" -> bpm.
    features: {
      key: { type: String }, // e.g., "C", "G#", etc.
      mode: { type: String, enum: ['major', 'minor', null], default: null },
      bpm: { type: Number },
    },

    // Per-track processing status
    status: {
      type: String,
      enum: TRACK_STATUSES,
      default: 'pending',
    },

    retries: { type: Number, default: 0 },
    error: {
      code: { type: String },
      message: { type: String },
    },
  },
  { _id: false }
);

const ProgressSchema = new Schema(
  {
    step: { type: String, enum: JOB_STATUSES, default: 'queued' },
    processed: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    percent: { type: Number, default: 0 }, // 0..100
  },
  { _id: false }
);

const OutputSchema = new Schema(
  {
    newPlaylistId: { type: String }, // mock or real Apple Music playlist id
    orderedTrackIds: [{ type: String }], // array of trackUid
  },
  { _id: false }
);

const ErrorSchema = new Schema(
  {
    code: { type: String },
    message: { type: String },
  },
  { _id: false }
);

const PlaylistJobSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User', required: true },

    sourcePlatform: {
      type: String,
      enum: ['appleMusic'],
      default: 'appleMusic',
    },

    // For mock runs, accept something like "mock:basic"
    sourcePlaylistId: { type: String },

    requestedAlgorithm: {
      type: String,
      enum: ALGORITHMS,
      default: 'dj',
    },

    status: { type: String, enum: JOB_STATUSES, default: 'queued' },

    progress: { type: ProgressSchema, default: () => ({}) },

    // Tracks to process (embedded so you can update each as analysis returns)
    tracks: { type: [TrackSchema], default: [] },

    // Optional bookkeeping you may populate
    trackCount: { type: Number },
    requiredCredits: { type: Number },

    output: { type: OutputSchema, default: () => ({}) },

    error: { type: ErrorSchema, default: null },
  },
  {
    timestamps: true,
  }
);

// Helpful indexes for dashboards and filtering
PlaylistJobSchema.index({ userId: 1, createdAt: -1 });
PlaylistJobSchema.index({ status: 1, createdAt: -1 });

// Optionally expose "id" instead of "_id" in JSON
PlaylistJobSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    // Keep both "id" and "_id" if you prefer; or delete _id:
    // delete ret._id;
    return ret;
  },
});

module.exports = model('PlaylistJob', PlaylistJobSchema);