import {mkdir,readFile,writeFile,copyFile} from "node:fs/promises";
import {resolve} from "node:path";
import {build} from "esbuild";
const root=resolve(import.meta.dirname,"..");
await mkdir(resolve(root,"dist"),{recursive:true});
// Source modules stay separate; no CDN, runtime dependency or external request.
for(const name of ["core.js","color-picker.js","sidebar-colors.js"])
  await copyFile(resolve(root,"src",name),resolve(root,"dist",name));
const pkg=JSON.parse(await readFile(resolve(root,"package.json"),"utf8"));
await build({entryPoints:[resolve(root,"src/sidebar-colors.js")],
  outfile:resolve(root,"dist/ha-sidebar-colors.js"),bundle:true,format:"iife",
  target:"es2022",charset:"utf8",legalComments:"inline",
  banner:{js:`/* Sidebar Colors ${pkg.version} | MIT | https://github.com/rockbaer2007/ha-sidebar-colors */`}});
await writeFile(resolve(root,"dist","version.json"),JSON.stringify({version:pkg.version,minimum_ha:"2026.10.3"},null,2)+"\n");
console.log("Built Sidebar Colors "+pkg.version+" including the single-file HACS/Marketplace bundle");
