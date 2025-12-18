def buildDocs(Map cfg = [:]) {
  def imageName = cfg.get('dockerImageName', 'ghcr.io/e-learning-by-sse/nm-self-learn-docs')
  def version   = cfg.get('dockerVersion',   "1.0.${env.BUILD_NUMBER}")
  boolean latest = cfg.containsKey('latest')
    ? cfg.latest
    : false
  def langs     = cfg.get('langs', ['de','en'])
  String releaseTag = latest ? 'latest' : version

  def baseDir = pwd()

  for (l in langs) {
    stage("Build docs: ${l}") {
        sh "sphinx-build -b html /docs/${l}/source /build/${l}"
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