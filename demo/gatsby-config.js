const path = require('path')

const pathPrefix = process.env.KB_BASE_PATH || '/'

module.exports = {
  pathPrefix,
  siteMetadata: {
    title: `Digital Garden`,
    description: `My personal digital garden`,
    author: `@RazvanSurdu`,
  },
  plugins: [
    {
      resolve: 'gatsby-theme-kb',
      options: {
        contentPath: path.resolve(__dirname, 'content'),
        wikiLinkLabelTemplate: '[[{{ title }}]]',
        getPluginMdx(defaultPluginMdx) {
          defaultPluginMdx.options.gatsbyRemarkPlugins.push({
            resolve: 'gatsby-remark-prismjs',
            options: {
              noInlineHighlight: true,
            },
          })
          return defaultPluginMdx
        },
      },
    },
    'gatsby-plugin-no-sourcemaps',
  ],
}
