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
        rootNote: 'Home',
        contentPath: path.resolve(__dirname, 'content'),
        wikiLinkLabelTemplate: '[[{{ title }}]]',
        ignore: [
          '**/_layouts/**',
          '**/.git/**',
          '**/.github/**',
          '**/.vscode/**',
          '**/.cache/**',
          '**/bak/**',
          '**/journals/**',
        ],        
        getPluginMdx(defaultPluginMdx) {
          defaultPluginMdx.options.gatsbyRemarkPlugins.push({
            resolve: 'gatsby-remark-prismjs',
            options: {
              noInlineHighlight: true,
            },
          })

          // so you can have your relative referenced files served, e.g. '../assets/img.png'.
          defaultPluginMdx.options.gatsbyRemarkPlugins.push({
            resolve: `gatsby-remark-copy-linked-files`,
            options: {
              ignoreFileExtensions: ['md', 'mdx'],
            },
          })

          return defaultPluginMdx
        }
      },
    },    
    {
      // this plugin makes sure your static files will be served by gatsby,
      //   but of course you need to reference them by absolute path, e.g. '/assets/img.png'.
      // if you have multiple directories, copy this plugin section and specify other directory
      // check https://github.com/csath/gatsby-plugin-copy-files-enhanced to find docs for this plugin
      resolve: 'gatsby-plugin-copy-files-enhanced',
      options: {
        source: path.resolve(__dirname, `../assets`),
        destination: '/assets',
        purge: false,
      },
    },
    'gatsby-plugin-no-sourcemaps',    
  ],
}
