/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

'use strict';

var helper = require('../../helper');
var db = require('../../..').data.db;
var expect = require('chai').expect;

describe('gendok.data.model.template', function () {
  var factory = helper.loadFactories(this);
  var Template = null;

  beforeEach(function () {
    Template = db.getModel('Template');
  });

  it('is an object', function () {
    expect(Template).to.be.an('object');
  });

  describe('the factory', function () {
    it('inserts a template into the db', function (done) {
      factory.create('Template', function (err, template) {
        expect(err).to.not.exist;
        expect(template).to.exist;
        done();
      });
    });
  });

  describe('validation', function () {
    describe('.type', function () {
      it('returns an error if an invalid compiler type is used', function () {
        factory.build('Template', function (err, tmpl) {
          expect(err).to.not.exist;
          expect(tmpl).to.exist;
          expect(tmpl.type).to.exist;

          tmpl.type = 'bogus';

          tmpl.validate().then(function (err) {
            expect(err).to.exist;
          });
        });
      });

      it('may not be empty', function (done) {
        var values = {type: ''};

        factory.build('Template', values, function (err, template) {
          expect(err).to.not.exist;
          expect(template.type).to.eql(values.type);

          template.validate().then(function (err) {
            expect(err).to.exist;
            expect(err.errors.length).to.eql(1);
            expect(err.errors[0].path).to.eql('type');
            done();
          }).catch(done);
        });
      });

      it('may not be undefined', function (done) {
        var values = {type: ''};

        factory.build('Template', values, function (err, template) {
          expect(err).to.not.exist;
          expect(template.type).to.eql(values.type);

          template.validate().then(function (err) {
            expect(err).to.exist;
            expect(err.errors.length).to.eql(1);
            expect(err.errors[0].path).to.eql('type');
            done();
          });
        });
      });
    });

    describe('.body', function () {
      it('may not be empty', function (done) {
        var values = {body: ''};

        factory.build('Template', values, function (err, template) {
          expect(err).to.not.exist;
          expect(template.body).to.eql(values.body);

          template.validate().then(function (err) {
            expect(err).to.exist;
            expect(err.errors.length).to.eql(1);
            expect(err.errors[0].path).to.eql('body');
            done();
          });
        });
      });
    });

    describe('.userId', function () {
      it('may not be empty', function (done) {
        var values = {userId: ''};

        factory.build('Template', values, function (err, template) {
          expect(err).to.not.exist;
          expect(template.userId).to.eql(values.userId);

          template.validate().then(function (err) {
            expect(err).to.exist;
            expect(err.errors.length).to.eql(1);
            expect(err.errors[0].path).to.eql('userId');
            done();
          });
        });
      });

      it('ensures userId is an existing user', function (done) {
        factory.create('Template', function (err, template) {
          expect(err).to.not.exist;
          expect(template.getUser()).to.exist;

          template.validate().then(function (err) {
            expect(err).to.not.exist;
          }).then(function () {
            template.userId = -1;
          }).then(function () {
            template.validate().then(function (err) {
              expect(err).to.exist;
              expect(err.errors.length).to.eql(1);
              expect(err.errors[0].path).to.eql('userId');
              done();
            });
          });
        });
      });
    });

    describe('.paperFormat', function () {
      it('may not be empty', function (done) {
        factory.create('User', function (err, user) {
          var values = {
            userId: user.id,
            type: 'html',
            body: '<p>Ich bin Inhalt!</p>',
            name: 'Template x',
            paperFormat: '',
            paperMargin: '3px',
            headerHeight: '2cm',
            footerHeight: '1cm'
          };

          var template = Template.build(values);
          template.validate().then(function (err) {
            expect(err).to.exist;
            expect(err.errors.length).to.eql(2);
            expect(err.errors[0].path).to.eql('paperFormat');
            done();
          });
        });
      });

      it('uses a default value when missing', function (done) {
        factory.create('User', function (err, user) {
          var values = {
            userId: user.id,
            type: 'html',
            body: '<p>Ich bin Inhalt!</p>',
            name: 'Template x',
            paperMargin: '3px',
            headerHeight: '2cm',
            footerHeight: '1cm'
          };

          var template = Template.build(values);
          template.validate().then(function (err) {
            expect(err).to.not.exist;
            expect(template.paperFormat).to.eql('A4');
            done();
          });
        });
      });

      it('may be any value between A3 and A5', function (done) {
        factory.create('User', function (err, user) {
          var values = {
            userId: user.id,
            type: 'html',
            body: '<p>Ich bin Inhalt!</p>',
            name: 'Template x',
            paperFormat: 'A3',
            paperMargin: '3px',
            headerHeight: '2cm',
            footerHeight: '1cm'
          };

          Template.build(values).validate().then(function (err) {
            expect(err).to.not.exist;

            values.paperFormat = 'A4';
            Template.build(values).validate().then(function (err) {
              expect(err).to.not.exist;

              values.paperFormat = 'A5';
              Template.build(values).validate().then(function (err) {
                expect(err).to.not.exist;

                values.paperFormat = 'A2';
                Template.build(values).validate().then(function (err) {
                  expect(err).to.exist;
                  expect(err.errors.length).to.eql(1);
                  done();
                });
              });
            });
          });
        });
      });
    });

    describe('.paperMargin', function () {
      it('may not be empty', function (done) {
        factory.create('User', function (err, user) {
          var values = {
            userId: user.id,
            type: 'html',
            body: '<p>Ich bin Inhalt!</p>',
            name: 'Template x',
            paperFormat: 'A4',
            paperMargin: '',
            headerHeight: '2cm',
            footerHeight: '1cm'
          };

          var template = Template.build(values);
          template.validate().then(function (err) {
            expect(err).to.exist;
            expect(err.errors.length).to.eql(2);
            expect(err.errors[0].path).to.eql('paperMargin');
            done();
          });
        });
      });

      it('uses a default value when missing', function (done) {
        factory.create('User', function (err, user) {
          var values = {
            userId: user.id,
            type: 'html',
            body: '<p>Ich bin Inhalt!</p>',
            name: 'Template x',
            paperFormat: 'A4',
            headerHeight: '2cm',
            footerHeight: '1cm'
          };

          var template = Template.build(values);
          template.validate().then(function (err) {
            expect(err).to.not.exist;
            expect(template.paperMargin).to.eql('0px');
            done();
          });
        });
      });

      it('may be a px or cm value', function (done) {
        factory.create('User', function (err, user) {
          var values = {
            userId: user.id,
            type: 'html',
            body: '<p>Ich bin Inhalt!</p>',
            name: 'Template x',
            paperFormat: 'A3',
            paperMargin: '3px',
            headerHeight: '2cm',
            footerHeight: '1cm'
          };

          Template.build(values).validate().then(function (err) {
            expect(err).to.not.exist;

            values.paperMargin = '1cm';
            Template.build(values).validate().then(function (err) {
              expect(err).to.not.exist;

              values.paperMargin = '1pt';
              Template.build(values).validate().then(function (err) {
                expect(err).to.exist;
                expect(err.errors.length).to.eql(1);
                done();
              });
            });
          });
        });
      });
    });

    describe('.headerHeight', function () {
      it('may not be empty', function (done) {
        factory.create('User', function (err, user) {
          var values = {
            userId: user.id,
            type: 'html',
            body: '<p>Ich bin Inhalt!</p>',
            name: 'Template x',
            paperFormat: 'A4',
            paperMargin: '1cm',
            headerHeight: '',
            footerHeight: '1cm'
          };

          var template = Template.build(values);
          template.validate().then(function (err) {
            expect(err).to.exist;
            expect(err.errors.length).to.eql(2);
            expect(err.errors[0].path).to.eql('headerHeight');
            done();
          });
        });
      });

      it('uses a default value when missing', function (done) {
        factory.create('User', function (err, user) {
          var values = {
            userId: user.id,
            type: 'html',
            body: '<p>Ich bin Inhalt!</p>',
            name: 'Template x',
            paperFormat: 'A4',
            paperMargin: '1cm',
            footerHeight: '1cm'
          };

          var template = Template.build(values);
          template.validate().then(function (err) {
            expect(err).to.not.exist;
            expect(template.headerHeight).to.eql('0px');
            done();
          });
        });
      });

      it('may be a px or cm value', function (done) {
        factory.create('User', function (err, user) {
          var values = {
            userId: user.id,
            type: 'html',
            body: '<p>Ich bin Inhalt!</p>',
            name: 'Template x',
            paperFormat: 'A3',
            paperMargin: '3px',
            headerHeight: '2cm',
            footerHeight: '1cm'
          };

          Template.build(values).validate().then(function (err) {
            expect(err).to.not.exist;

            values.headerHeight = '10px';
            Template.build(values).validate().then(function (err) {
              expect(err).to.not.exist;

              values.headerHeight = '1pt';
              Template.build(values).validate().then(function (err) {
                expect(err).to.exist;
                expect(err.errors.length).to.eql(1);
                done();
              });
            });
          });
        });
      });
    });

    describe('.footerHeight', function () {
      it('may not be empty', function (done) {
        factory.create('User', function (err, user) {
          var values = {
            userId: user.id,
            type: 'html',
            body: '<p>Ich bin Inhalt!</p>',
            name: 'Template x',
            paperFormat: 'A4',
            paperMargin: '1cm',
            headerHeight: '1cm',
            footerHeight: ''
          };

          var template = Template.build(values);
          template.validate().then(function (err) {
            expect(err).to.exist;
            expect(err.errors.length).to.eql(2);
            expect(err.errors[0].path).to.eql('footerHeight');
            done();
          });
        });
      });

      it('uses a default value when missing', function (done) {
        factory.create('User', function (err, user) {
          var values = {
            userId: user.id,
            type: 'html',
            body: '<p>Ich bin Inhalt!</p>',
            name: 'Template x',
            paperFormat: 'A4',
            paperMargin: '1cm',
            headerHeight: '1cm'
          };

          var template = Template.build(values);
          template.validate().then(function (err) {
            expect(err).to.not.exist;
            expect(template.footerHeight).to.eql('0px');
            done();
          });
        });
      });

      it('may be a px or cm value', function (done) {
        factory.create('User', function (err, user) {
          var values = {
            userId: user.id,
            type: 'html',
            body: '<p>Ich bin Inhalt!</p>',
            name: 'Template x',
            paperFormat: 'A3',
            paperMargin: '3px',
            headerHeight: '2cm',
            footerHeight: '1cm'
          };

          Template.build(values).validate().then(function (err) {
            expect(err).to.not.exist;

            values.footerHeight = '10px';
            Template.build(values).validate().then(function (err) {
              expect(err).to.not.exist;

              values.footerHeight = '1pt';
              Template.build(values).validate().then(function (err) {
                expect(err).to.exist;
                expect(err.errors.length).to.eql(1);
                done();
              });
            });
          });
        });
      });
    });
  });

  describe('instance methods', function () {
    describe('toPublicObject', function () {
      it('is a function', function () {
        factory.build('Template', function (err, template) {
          expect(template.toPublicObject).to.be.a('function');
        });
      });

      it('strips the userId', function (done) {
        factory.build('Template', function (err, template) {
          var publicTemplate = template.toPublicObject();
          expect(publicTemplate.body).to.exist;
          expect(publicTemplate.type).to.exist;
          expect(publicTemplate.userId).to.not.exist;
          done();
        });
      });
    });
  });
});
