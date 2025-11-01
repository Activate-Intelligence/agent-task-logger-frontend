const config = {
  default: {
    override: {
      converter: () => import('./opennext/aws-apigw-v2-normalized.mjs'),
    },
  },
}

export default config
