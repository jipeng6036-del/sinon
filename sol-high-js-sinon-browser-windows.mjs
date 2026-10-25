import { createRequire } from 'node:module';
import { Readable } from 'node:stream';
const repo='F:/Github-PR/inspection/sol-high-sinon-2384';
process.chdir(repo);
const require=createRequire(repo+'/package.json');
const {glob}=require('glob');
const esbuild=require('esbuild');
const {mochify}=require('@mochify/mochify');
const mode=process.argv[2]||'headless';
const packageConfig=require(repo+'/package.json').mochify;
const pattern=mode==='webworker'?'test/webworker/webworker-support-assessment.js':packageConfig.spec;
const files=(await glob(pattern)).sort();
const contents=files.map(file=>'require('+JSON.stringify('./'+file.replaceAll('\\','/'))+');').join('\n');
const result=await esbuild.build({stdin:{contents,resolveDir:repo},bundle:true,sourcemap:'inline',define:{'process.env.NODE_DEBUG':'""'},external:['fs'],write:false});
console.log(JSON.stringify({mode,pattern,testFiles:files.length,bundleBytes:result.outputFiles[0].contents.length,browserExecutable:process.env.PUPPETEER_EXECUTABLE_PATH}));
const bundlePath='F:/Github-PR/ci-evidence/sol-high-js-sinon-browser-'+mode+'.js'; const bundleText=mode==='coverage'?require('node:child_process').execFileSync(process.execPath,[repo+'/coverage.cjs'],{input:contents,maxBuffer:64*1024*1024}).toString():result.outputFiles[0].text; require('node:fs').writeFileSync(bundlePath,bundleText);
const outcome=await mochify({driver:'puppeteer',reporter:packageConfig.reporter,timeout:packageConfig.timeout,spec:[bundlePath],bundle:null,bundle_stdin:undefined,serve:mode==='webworker'?repo:undefined,driver_options:{executablePath:process.env.PUPPETEER_EXECUTABLE_PATH,args:['--no-sandbox']}});
process.exitCode=outcome.exit_code;


