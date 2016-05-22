var TChar = require('../dist/ansiterminal.js').TChar;
var chai = require('chai');

describe('TChar', function() {
    it('clone', function () {
        var tchar1 = new TChar('#');
        var tchar2 = tchar1.clone();
        chai.expect(tchar1).eql(tchar2);
    });
    it('equals', function () {
        var tchar1 = new TChar('#');
        var tchar2 = tchar1.clone();
        chai.expect(tchar1.equals(tchar2)).eql(true);
    });
    it('set/get attribute', function () {
        var attr = {
                bold: false,
                italic: false,
                underline: false,
                blink: false,
                inverse: false,
                conceal: false,
                foreground: {set: false, RGB: false, color: [0, 0, 0]},
                background: {set: false, RGB: false, color: [0, 0, 0]}
            };
        var bits = ['bold', 'italic', 'underline', 'blink', 'inverse', 'conceal'];

        // bit fields
        for (var i=0; i<bits.length; ++i) {
            var tchar = new TChar('#');
            var a = {};
            a[bits[i]] = true;
            a.bold = false;
            tchar.setAttributes(a);
            attr[bits[i]] = true;
            attr.bold = false;
            chai.expect(tchar.getAttributes()).eql(attr);
            attr[bits[i]] = false;
        }

        // clear all
        tchar = new TChar('#', 123, 456789);
        tchar.setAttributes(0);
        chai.expect(tchar.getAttributes()).eql(attr);

        // foreground/background
        tchar = new TChar('#');
        tchar.setAttributes({foreground: {set: false, RGB: false, color: [0, 0, 0]},
                             background: {set: false, RGB: false, color: [0, 0, 0]}});
        chai.expect(tchar.getAttributes()).eql(attr);
        tchar.setAttributes({foreground: {set: true, RGB: true, color: [1, 2, 3]},
                             background: {set: true, RGB: true, color: [3, 2, 1]}});
        attr.foreground = {set: true, RGB: true, color: [1, 2, 3]};
        attr.background = {set: true, RGB: true, color: [3, 2, 1]};
        chai.expect(tchar.getAttributes()).eql(attr);
        tchar.setAttributes({foreground: {},
                             background: {}});
        chai.expect(tchar.getAttributes()).eql(attr);
    });
});