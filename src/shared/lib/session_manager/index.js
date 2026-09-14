const mongoose = require('mongoose');

class SessionManager {
    static useTransactions = process.env.MONGO_USE_REPLICA_SET == 'true';

    /**
     * Executes a callback within a transaction (if useTransactions is true).
     * @param {Function} callback - The logic to execute within a transaction.
     */
    static async executeCallbackInTransaction(callback, session = null, useTransactions = this.useTransactions) {
        if (!useTransactions) {
            // Transactions are disabled; execute without a session
            return callback(null);
        }

        let sessionIsCreateHere = false
        try {

            if (!session) {
                sessionIsCreateHere = true
                session = await mongoose.startSession();
                session.startTransaction();
            }
            const result = await callback(session);

            if (sessionIsCreateHere) {
                await session.commitTransaction();
            }
            return result;
        } catch (error) {
            if (sessionIsCreateHere) {
                await session.abortTransaction();
            }
            throw error;
        } finally {
            if (sessionIsCreateHere) {
                session.endSession(); // Clean up session
            }
        }
    }

    /**
     * Executes a query with an optional session.
     * @param {mongoose.Query} query - The Mongoose query to execute.
     * @param {mongoose.ClientSession} [session=null] - Optional MongoDB session.
     * @returns {Promise<any>} - The result of the query execution.
     */
    static async executeQueryHookWithSession(query, session = null) {
        if (session) {
            query = query.session(session); // Attach the session if provided
        }
        return await query.exec(); // Execute the query
    }

}

module.exports = SessionManager;