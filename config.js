const GITHUB_OAUTH_URL = "https://github.com/login/oauth/authorize"
const SCOPE = "user"
const client_id = "fc6cbf89f1716edcdcc8"


module.exports = {
    github: {
        client_id,
        client_secret: "a7dc0e693a0eac4a5ce2eeaff0139d03f6de7b0f",
        reqUrl: "https://github.com/login/oauth/access_token"
    },
    GITHUB_OAUTH_URL,
    OAUTH_URL: `${GITHUB_OAUTH_URL}?client_id=${client_id}&scope=${SCOPE}`
}
