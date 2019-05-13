'use strict'

const connect = require('gulp-connect')
const path = require('path')
const gulp = require('gulp')

const build = require('./tasks/build')
const buildPreview = require('./tasks/build-preview')
const format = require('./tasks/format')
const lintCss = require('./tasks/lint-css')
const lintJs = require('./tasks/lint-js')
const pack = require('./tasks/pack')
const preview = require('./tasks/preview')
const release = require('./tasks/release')

const bundleName = 'ui'
const buildDir = process.env.CONTEXT === 'deploy-preview' ? 'public/dist' : 'build'
const previewSiteSrcDir = 'preview-site-src'
const previewSiteDestDir = 'public'
const srcDir = 'src'
const destDir = path.join(previewSiteDestDir, '_')

const cssFiles = [path.join(srcDir, 'css/**/*.css'), `!${path.join(srcDir, 'css/**/*.min.css')}`]

const jsFiles = [
  'gulpfile.js',
  'tasks/**/*.js',
  path.join(srcDir, '{helpers,js}/**/*.js'),
  `!${path.join(srcDir, '{helpers,js}/**/*.min.js')}`,
]

gulp.task('lint:css', () => lintCss(cssFiles))
gulp.task('lint:js', () => lintJs(jsFiles))
gulp.task('lint', gulp.series(['lint:css', 'lint:js'], (done) => done()))

gulp.task('format', () => format(jsFiles))

gulp.task('build', function () {
  return build(srcDir, destDir, false)
})

gulp.task('build:preview', gulp.series(['build'], () =>
  buildPreview(srcDir, destDir, previewSiteSrcDir, previewSiteDestDir, connect.reload)
))

gulp.task('preview', gulp.series(['build:preview'], () =>
  preview(previewSiteDestDir, {
    port: 5252,
    livereload: process.env.LIVERELOAD === 'true',
    watch: {
      src: [srcDir, previewSiteSrcDir],
      onChange: () => gulp.start('build:preview'),
    },
  })
))

gulp.task('pack', gulp.series(['build', 'lint'], () => pack(destDir, buildDir, bundleName)))

gulp.task('release', gulp.series(['pack'], () =>
  release(buildDir, bundleName, 'couchbase', 'docs-ui', process.env.GITHUB_API_TOKEN)))

gulp.task('default', gulp.series(['build'], (done) => done()))
