const mongoose = require('mongoose');

const softDeletePlugin = (schema) => {
    if (!schema.path('deletedAt')) {
        schema.add({
            deletedAt: { type: Date, required: false },
        });
    }

    if (!schema.path('deletedBy')) {
        schema.add({
            deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
        });
    }

    if (!schema.query.includeDeleted) {
        schema.query.includeDeleted = function() {
            this._includeDeleted = true;
            return this;
        };
    }

    if (!schema.query.onlyDeleted) {
        schema.query.onlyDeleted = function() {
            this._onlyDeleted = true;
            return this;
        };
    }

    const applySoftDeleteFilter = function() {
        if (this._onlyDeleted) {
            this.where({ deletedAt: { $exists: true } });
        } else if (!this._includeDeleted) {
            this.where({ deletedAt: { $exists: false } });
        }
    };

    schema.pre(['find', 'findOne', 'countDocuments', 'findOneAndUpdate', 'findOneAndDelete', 'findOneAndReplace'], applySoftDeleteFilter);

    schema.methods.softDelete = async function(userId, session = null) {
        if (!this.deletedAt) {
            this.deletedAt = new Date();
            if (schema.path('deletedBy') && userId) {
                this.deletedBy = userId;
            }
            await this.save({ session });
        }
    };

    schema.methods.restore = async function(session = null) {
        await this.constructor.updateOne({ _id: this._id }, { $unset: { deletedAt: "", deletedBy: "" } }, { session });
    };

    schema.methods.hardDelete = async function(session = null) {
        await this.remove({ session });
    };

    schema.statics.restoreAll = async function(session = null) {
        return this.updateMany({ deletedAt: { $exists: true } }, { $unset: { deletedAt: "", deletedBy: "" } }, { session });
    };


    schema.statics.hardDeleteAfterTime = async function(days, session = null) {
        const threshold = new Date();
        threshold.setDate(threshold.getDate() - days);
        return this.deleteMany({ deletedAt: { $lte: threshold } }, { session });
    };

    schema.statics.findNonDeleted = function(session = null) {
        return this.find({ deletedAt: { $exists: false } }).session(session);
    };

    schema.statics.findDeleted = function(session = null) {
        return this.find({ deletedAt: { $exists: true } }).session(session);
    };
};

module.exports = softDeletePlugin;