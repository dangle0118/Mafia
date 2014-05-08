require.config({
  baseUrl: "http://localhost:8080/js",
  packages: [],
  shim: {
    "angular": {
      exports: "angular"
    },
    "btford.socket-io": {
      deps: ["angular", "socket.io"]
    },
    "ui-router": {
      deps: ["angular"]
    },
    "ui-bootstrap": {
      deps: ["angular"]
    }
  },
  paths: {
    "angular": "../bower_components/angular/angular",
    "btford.socket-io": "../bower_components/angular-socket-io/socket",
    "socket.io": "lib/socket.io",
    "ui-router": "../bower_components/angular-ui-router/release/angular-ui-router",
    "ui-bootstrap": "../bower_components/angular-bootstrap/ui-bootstrap-tpls" 
  },
  modules: [
  {
    name: "boot"
  }],
  priority: ["angular"]
})