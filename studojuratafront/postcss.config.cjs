module.exports = {
  plugins: {
    'postcss-preset-mantine': {},
    'postcss-simple-vars': {
      variables: {
        'mantine-breakpoint-xs': '30em',
        'mantine-breakpoint-sm': '40em',
        'mantine-breakpoint-md': '64em',
        'mantine-breakpoint-lg': '80em',
        'mantine-breakpoint-xl': '90em',
      },
    },
  },
}
