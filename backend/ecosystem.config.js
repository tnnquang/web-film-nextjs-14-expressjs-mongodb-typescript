module.exports = {
    apps: [
      {
        name: "phimapi", // Replace with your application's name
        script: "./dist/index.js", // Replace with the path to your application's entry point
        instances: 1, // Set the number of instances to run
        exec_mode: "fork", // Use the "fork" mode for better performance
        autorestart: true, // Automatically restart on crashes
        watch: false, // Disable watching for changes (optional)
        max_memory_restart: "512M", // Set the maximum memory usage before restarting (adjust as needed)
        env: {
          NODE_ENV: "production"
        }
      }
    ]
  };