import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {runFixture} from 'file:///F:/Github-PR/inspection/sol-high-sinon-2384/test/distribution/helpers/run-fixture.mjs';
const repo='F:/Github-PR/inspection/sol-high-sinon-2384';
const evidence='F:/Github-PR/ci-evidence';
const [{filename}]=JSON.parse(fs.readFileSync(evidence+'/sol-high-js-sinon-pack.json','utf8').replace(/^\uFEFF/,''));
const tarballPath=evidence+'/sol-high-js-sinon-pack/'+filename;
const fixtures=['require-default','import-default','import-named','require-package-exports','require-fake-timers-sync','import-default-and-named'];
for(const name of fixtures){runFixture({fixtureDir:repo+'/test/distribution/fixtures/'+name,tarballPath,entryFile:name.startsWith('require')?'index.cjs':'index.mjs'});console.log('PASS '+name);}
const temp=fs.mkdtempSync(evidence+'/sol-high-js-sinon-manifest-');
fs.mkdirSync(path.join(temp,'node_modules'));
execFileSync('tar',['-xzf',tarballPath,'-C',path.join(temp,'node_modules')]);
fs.renameSync(path.join(temp,'node_modules/package'),path.join(temp,'node_modules/sinon'));
fs.copyFileSync(repo+'/test/distribution/helpers/read-public-api.cjs',path.join(temp,'extract.cjs'));
const actual=JSON.parse(execFileSync(process.execPath,['-e',"console.log(JSON.stringify(require('./extract.cjs')))"],{cwd:temp,env:{...process.env,NODE_PATH:repo+'/node_modules'}}).toString());
const expected=JSON.parse(fs.readFileSync(repo+'/test/distribution/public-api-manifest.json','utf8'));
assert.deepEqual(actual,expected);console.log('PASS exact packed public API manifest');
