console.log('{"method":"GET","path":"/test","status":200,"durationMs":3}');
console.error('WARN: fixture warning');
console.error('TypeError: fixture failure');
console.error('    at fixture (emitter.mjs:3:1)');
console.log('after error');
process.exitCode = 7;
