const assert = require('assert');

module.exports = function() {
  describe('distance library', function() {
    const CollisionDetection = require('../src/library/CollisionDetection');
    it('two point angle', function() {
      const originPoint = { x: 0, y: 0 };
      assert.equal(
        CollisionDetection.getAngle(originPoint, originPoint), 0);
      assert.equal(
        CollisionDetection.getAngle(originPoint, { x: 1, y: 0 }), 0);
      assert.equal(
        CollisionDetection.getAngle(originPoint, { x: -1, y: 0 }), Math.PI);
      assert.equal(
        CollisionDetection.getAngle(originPoint, { x: 0, y: 1 }), Math.PI / 2);
      assert.equal(
        CollisionDetection.getAngle(originPoint, { x: 0, y: -1 }), Math.PI * 3 / 2);
    });
    it('two point distance', function() {
      const originPoint = { x: 0, y: 0 };
      assert.equal(
        CollisionDetection.RectRectDistance(originPoint, originPoint), 0);
      assert.equal(
        CollisionDetection.RectRectDistance(originPoint, { x: 1, y: 0 }), 1);
      assert.equal(
        CollisionDetection.RectRectDistance(originPoint, { x: -1, y: 0 }), 1);
      assert.equal(
        CollisionDetection.RectRectDistance(originPoint, { x: 0, y: 1 }), 1);
      assert.equal(
        CollisionDetection.RectRectDistance(originPoint, { x: 0, y: -1 }), 1);
    });
    it('two rect distance', function() {
      const originPoint = { x: 0, y: 0, width: 2, height: 2 };
      assert.equal(
        CollisionDetection.RectRectDistance(originPoint, originPoint), 0);
      assert.equal(
        CollisionDetection.RectRectDistance(originPoint, { x: 2, y: 0, width: 2, height: 2 }), -2);
      assert.equal(
        CollisionDetection.RectRectDistance(originPoint, { x: 4, y: 0, width: 2, height: 2 }), 2);
      assert.equal(
        CollisionDetection.RectRectDistance(originPoint, { x: 4, y: 4, width: 2, height: 2 }).toFixed(8),
        Math.sqrt(8).toFixed(8)
      );
    });
  });
  describe('Victor', function() {
    const Victor = require('victor');
    it('victor', function() {
      const origin = new Victor();

      assert.deepEqual(
        origin.toArray(), [0, 0]);
      assert.deepEqual(
        origin.toObject(), { x: 0, y: 0 });
      assert.deepEqual(
        origin.x, 0);
      origin.add(new Victor(1, 0));
      assert.deepEqual(
        origin.toArray(), [1, 0]);
      origin.add(new Victor(0, 1));
      assert.deepEqual(
        origin.toArray(), [1, 1]);
      origin.add(new Victor(0, -0.5));
      assert.deepEqual(
        origin.toArray(), [1, 0.5]);
    });
  });
}