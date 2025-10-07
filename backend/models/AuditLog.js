import mongoose from "mongoose";

const AuditLogSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    action: {
        type: String,
        enum: ['CREATE', 'UPDATE', 'DELETE', 'SUSPEND', 'APPROVE', 'REJECT'],
        required: true
    },
    entityType: {
        type: String,
        required: true,
        enum: ['Product', 'Vendor']
    },
    entityId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'entityType'
    },
    details: { type: Object }
}, { timestamps: true });