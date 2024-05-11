import {
  BiLogoCss3,
  BiLogoHtml5,
  BiLogoJavascript,
  BiLogoLess,
  BiLogoSass,
  BiLogoTypescript,
  BiLogoReact,
  BiLogoNodejs,
} from 'react-icons/bi';
import { LuFileJson2 } from 'react-icons/lu';

import { FileExtension } from '@shared/lib';

export const FILE_ICON_MAP = {
  tsx: (
    <BiLogoReact className="w-full h-full text-blue-600" aria-hidden="true" />
  ),
  ts: (
    <BiLogoTypescript
      className="w-full h-full text-blue-600"
      aria-hidden="true"
    />
  ),
  jsx: (
    <BiLogoReact className="w-full h-full text-blue-300" aria-hidden="true" />
  ),
  js: (
    <BiLogoJavascript
      className="w-full h-full text-amber-400"
      aria-hidden="true"
    />
  ),
  cjs: (
    <BiLogoNodejs className="w-full h-full text-lime-500" aria-hidden="true" />
  ),
  mjs: (
    <BiLogoNodejs className="w-full h-full text-lime-500" aria-hidden="true" />
  ),
  css: <BiLogoCss3 className="w-full h-full text-sky-500" aria-hidden="true" />,
  htm: (
    <BiLogoHtml5 className="w-full h-full text-red-500" aria-hidden="true" />
  ),
  html: (
    <BiLogoHtml5 className="w-full h-full text-red-500" aria-hidden="true" />
  ),
  json: (
    <LuFileJson2 className="w-full h-full text-lime-500" aria-hidden="true" />
  ),
  less: (
    <BiLogoLess className="w-full h-full text-blue-600" aria-hidden="true" />
  ),
  sass: (
    <BiLogoSass className="w-full h-full text-rose-500" aria-hidden="true" />
  ),
  scss: (
    <BiLogoSass className="w-full h-full text-rose-500" aria-hidden="true" />
  ),
} satisfies Record<FileExtension, React.ReactNode>;