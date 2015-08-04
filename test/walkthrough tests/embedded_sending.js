// Unit Testing Imports
var assert = require('assert');
var fs = require('fs');
var async = require('async');

var docusign = require('../../docusign.js');

describe('embedded_sending', function () {
  var fullName = 'DocuSign NPM';
  var docusignEnv = 'demo';
  var debug = false;

  var config = JSON.parse(fs.readFileSync('config.json'));
  var integratorKey = config.DOCUSIGN_INTEGRATOR_KEY;
  var email = config.DOCUSIGN_TEST_EMAIL;
  var password = config.DOCUSIGN_TEST_PASSWORD;

  it('should return embedded sending url', function (done) {
    async.waterfall([

      // **********************************************************************************
      // Step 1 - Initialize DocuSign Object with Integratory Key and Desired Environment
      // **********************************************************************************
      function init (next) {
        docusign.init(integratorKey, docusignEnv, debug, function (error, response) {
          assert.ok(!error, 'Unexpected ' + error);
          var message = response.message;
          assert.strictEqual(message, 'successfully initialized');
          next(null);
        });
      },

      // **********************************************************************************
      // Step 2 - Authenticate Youself With DocuSign to Recieve an OAuth Token and BaseUrl
      // **********************************************************************************
      function createClient (next) {
        docusign.client(email, password, function (error, response) {
          assert.ok(!error, 'Unexpected ' + error);
          next(null, response);
        });
      },

      // **********************************************************************************
      // Step 3 - Get the Embedded Sender View
      // **********************************************************************************
      function getEmbeddedSenderView (client, next) {
        var buffer = fs.readFileSync('test/SampleDocument.pdf');
        var files = [{
          name: 'SampleDocument.pdf',
          extension: 'pdf',
          base64: new Buffer(buffer).toString('base64')
        }];
        client.envelopes.getView('send', fullName, email, files, 'http://www.docusign.com/devcenter', null, function (error, response) {
          assert.ok(!error, 'Unexpected ' + error);
          console.log('Navigate to this URL to start the Embedded Sending workflow: ' + response.url);
          next(null, client);
        });
      },

      // **********************************************************************************
      // Step 4 - Revoke OAuth Token for Logout
      // **********************************************************************************
      function logOut (client, next) {
        client.logOut(function (err, response) {
          assert.strictEqual(err, null);
          next(null);
        });
      }
    ], function () {
      done();
    });
  });
});