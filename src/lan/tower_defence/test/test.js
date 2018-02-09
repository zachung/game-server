const assert = require('assert');
const Graphic = require('../src/class/Graphic');
const Group = require('../src/class/Group');

module.exports = function() {
  describe('Display', function() {
    it('group', function() {
      const graphic = new Graphic({
      	x: 1
      });
      const group = new Group();
      group.add(graphic);
      assert.equal(group.size, 1);

      group.forEach(g => assert.equal(g.x, 1));
      
      group.delete(graphic);
      assert.equal(group.size, 0);

      const subgroup = new Group();
      subgroup.add(graphic);
      group.add(subgroup);
      group.step(1/60);
    });
  });
}