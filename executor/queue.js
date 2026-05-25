const { Queue } = require('bullmq');

//Redis connection config
const connection = {
    host: process.env.REDIS_HOST || 'redis',
    port: 6379
};

//create submission queue
const submissionQueue = new Queue('code-submission', {
    connection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000
        },
        removeOnComplete: 100,   //keep only 100 removing others to keep cache free for new
        removeOnFail: 50         //keep only 50 failed remove others
    }
});

console.log('Submission queue created');

module.exports = { submissionQueue, connection };