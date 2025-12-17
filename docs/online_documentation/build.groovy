def run(Map cfg = [:]) {
  def imageName = cfg.get('dockerImageName', 'ghcr.io/e-learning-by-sse/nm-self-learn-docs')
  def version   = cfg.get('dockerVersion',   "1.0.${env.BUILD_NUMBER}")
  boolean latest = cfg.containsKey('latest')
    ? cfg.latest
    : false
  def langs     = cfg.get('langs', ['de','en'])
  String releaseTag = latest ? 'latest' : version

  for (l in langs) {
    stage("Build docs: ${l}") {
      sh """
        set -e
        uid="\$(id -u)"; gid="\$(id -g)"
        docker run --rm \
          --user "\$uid:\$gid" \
          -v "${baseDir}/docs:/docs" \
          -v "${baseDir}/build:/build" \
          sphinxdoc/sphinx \
          sphinx-build -b html /docs/${l}/source /build/${l}
      """
    }
  }

  stage('Build Docker and publish') {
    ssedocker {
      create { target "${imageName}:${version}" }
      publish { tag "${releaseTag}" }
    }
  }
}

return this