console.log('{"method":"GET","path":"/test","status":200,"durationMs":3}');
console.error('WARN: fixture warning');
console.error('TypeError: fixture failure');
console.error('    at fixture (emitter.mjs:3:1)');
// stdout and stderr are separate pipes, so give the parent time to read the
// stderr lines before the stdout line that should flush the stack trace.
setTimeout(() => {
  console.log('after error');
  process.exitCode = 7;
}, 100);
