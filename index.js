const core = require('@actions/core');

try {
  const databaseType = core.getInput('database_type'), 
        databaseId = core.getInput('database_id');
  console.log(`Fetching from a ${databaseType}:${databaseId}!`);
  core.setOutput("success", true);
} catch (error) {
  core.setFailed(error.message);
}