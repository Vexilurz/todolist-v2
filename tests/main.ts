import { Application } from 'spectron';
const assert = require('assert');
const path = require('path');

let app = new Application({
    path: path.join(__dirname, '..', 'node_modules', '.bin', 'electron'),
    args: [
        path.join(__dirname, '..')
    ],
    waitTimeout: 10000
});

app.start()
.then(() => {
  // Check if the window is visible
  return app.browserWindow.isVisible()
}).then((isVisible) => {
  // Verify the window is visible
  assert.equal(isVisible, true)
}).then(() => {
  // Stop the application
  return app.stop()
}).catch((error) => {
  // Log any failures
  console.error('Test failed', error.message)
})