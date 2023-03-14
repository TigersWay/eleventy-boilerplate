require('dotenv').config();


module.exports = (eleventyConfig) => {

  // Plugins
  eleventyConfig.addPlugin(require('@11ty/eleventy').EleventyHtmlBasePlugin);

  // Custom Data file formats: yaml
  eleventyConfig.addDataExtension('yaml', contents => require('js-yaml').load(contents));


  // Filters
  require('fast-glob').sync(['./site/_filters/*.js']).forEach(file => {
    let filters = require('./' + file);
    Object.keys(filters).forEach(name => eleventyConfig.addFilter(name, filters[name]));
  });


  // Engine & Filter: Markdown
  const Markdown = require('markdown-it')({
    html: true,         // Enable HTML tags in source
    breaks: true,       // Convert '\n' in paragraphs into <br>
    linkify: true,      // Autoconvert URL-like text to links
    typographer: true,  // Enable some language-neutral replacement + quotes beautification
  })
    .use(require('markdown-it-link-attributes'), {
      pattern: /^(https?:)?\/\//,
      attrs: {
        target: '_blank',
        rel: 'noopener'
      }
    });
  eleventyConfig.setLibrary('md', Markdown);
  eleventyConfig.addFilter('markdown', content => Markdown.render(String(content)));

  // Engine: Nunjucks
  eleventyConfig.setNunjucksEnvironmentOptions({ trimBlocks: true, lstripBlocks: true });


  // Static resources
  eleventyConfig.addPassthroughCopy({ 'site/static': '.' });
  eleventyConfig.setServerPassthroughCopyBehavior('passthrough');


  if (process.env.NODE_ENV === 'production') {

    // Transform : html-minifier
    eleventyConfig.addTransform('html-minify', async (content, outputPath) => {
      if (outputPath && /(\.html|\.xml)$/.test(outputPath)) {
        return require('html-minifier').minify(content, {
          useShortDoctype: true,
          minifyJS: true,
          collapseWhitespace: true,
          keepClosingSlash: true
        });
      }
      return content;
    });

  }


  return {
    templateFormats: ['md', 'njk'],
    markdownTemplateEngine: 'njk',

    dir: {
      input: './site',
      includes: '_theme/layouts',
      output: './public'
    }
  };
};
