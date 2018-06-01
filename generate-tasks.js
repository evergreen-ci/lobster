const { existsSync, mkdirSync, writeFileSync, lstatSync, readdirSync } = require('fs');
const { join } = require('path');

const scanDirs = ['server', 'src'];

const isFile = f => lstatSync(f).isFile();
const isDirectory = source => lstatSync(source).isDirectory();

// given a relative directory, return an array containing all directories
// located under that directory, including the directory itself
const getDirectories = source =>
  readdirSync(source)
    .map(val => join(source, val))
    .filter(isDirectory)
    .reduce((acc, val) => acc.concat(getDirectories(val)).concat([val]), []);

const endsWithAnyOf = (ends, testVal) =>
  ends.reduce((acc, val) => acc || testVal.endsWith(val), false);

const isFileWithEnding = (endings, file) =>
  isFile(file) && endsWithAnyOf(endings, file);

// given a directory, return true if that directory has files ending in
// .spec.js or .test.js
const hasTests = dir =>
  readdirSync(dir)
    .reduce((acc, val) => acc || isFileWithEnding(['.spec.js', '.test.js'], join(dir, val)), false);

// return a function that given a directory, returns a task with the given
// prefix, npm script, and bash file glob. The directory forms the suffix of
// the task name
function makeTask(prefix, cmd, match) {
  return function(dir) {
    return {
      'name': prefix + '-' + dir.replace(/\//g, '-').toLowerCase(),
      'commands': [
        {
          'func': 'preamble'
        },
        {
          'func': 'npm',
          'vars': {
            'cmd': 'run-script ' + cmd + ' -- ' + dir + '/' + match
          }
        }
      ]
    };
  };
}


const dirs = scanDirs.reduce((acc, val) => acc.concat(getDirectories(val)), []).concat(scanDirs);
const testDirs = dirs.filter(hasTests);
console.log('Will run tests in: ', testDirs);

const testTasks = testDirs.map(makeTask('test', 'test-ci', '*.{spec,test}.js'));
var gt = {
  'buildvariants': [
    {
      'name': 'ubuntu1604',
      'tasks': testTasks.map(task => task.name)
    }
  ],
  'tasks': testTasks
};

console.log('Generating tasks with the following payload: ', JSON.stringify(gt, null, 2));

const outDir = join(__dirname, 'build');
const outFile = join(outDir, '.tasks.json');
if (!existsSync(outDir)) {
  console.log('Making output directory: ', outDir);
  mkdirSync(outDir);
}
console.log('Writing to: ', outFile);
writeFileSync(outFile, JSON.stringify(gt));
