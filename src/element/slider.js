/*
    Copyright 2008-2013
        Matthias Ehmann,
        Michael Gerhaeuser,
        Carsten Miller,
        Bianca Valentin,
        Alfred Wassermann,
        Peter Wilfahrt

    This file is part of JSXGraph.

    JSXGraph is free software dual licensed under the GNU LGPL or MIT License.
    
    You can redistribute it and/or modify it under the terms of the
    
      * GNU Lesser General Public License as published by
        the Free Software Foundation, either version 3 of the License, or
        (at your option) any later version
      OR
      * MIT License: https://github.com/jsxgraph/jsxgraph/blob/master/LICENSE.MIT
    
    JSXGraph is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Lesser General Public License for more details.
    
    You should have received a copy of the GNU Lesser General Public License and
    the MIT License along with JSXGraph. If not, see <http://www.gnu.org/licenses/>
    and <http://opensource.org/licenses/MIT/>.
 */


/*global JXG: true, define: true*/
/*jslint nomen: true, plusplus: true*/

/* depends:
 jxg
 math/math
 base/constants
 base/point
 utils/type
  elements:
   point
   group
   segment
   ticks
   glider
   text
 */

/**
 * @fileoverview The geometry object slider is defined in this file. Slider stores all
 * style and functional properties that are required to draw and use a slider on
 * a board.
 */

define([
    'jxg', 'math/math', 'base/constants', 'utils/type', 'base/point', 'base/group', 'base/line', 'base/ticks', 'base/text'
], function (JXG, Mat, Const, Type, Point, Group, Line, Ticks, Text) {

    "use strict";

    /**
     * @class A slider can be used to choose values from a given range of numbers.
     * @pseudo
     * @description
     * @name Slider
     * @augments Glider
     * @constructor
     * @type JXG.Point
     * @throws {Exception} If the element cannot be constructed with the given parent objects an exception is thrown.
     * @param {Array_Array_Array} start,end,data The first two arrays give the start and the end where the slider is drawn
     * on the board. The third array gives the start and the end of the range the slider operates as the first resp. the
     * third component of the array. The second component of the third array gives its start value.
     * @example
     * // Create a slider with values between 1 and 10, initial position is 5.
     * var s = board.create('slider', [[1, 2], [3, 2], [1, 5, 10]]);
     * </pre><div id="cfb51cde-2603-4f18-9cc4-1afb452b374d" style="width: 200px; height: 200px;"></div>
     * <script type="text/javascript">
     *   (function () {
     *     var board = JXG.JSXGraph.initBoard('cfb51cde-2603-4f18-9cc4-1afb452b374d', {boundingbox: [-1, 5, 5, -1], axis: true, showcopyright: false, shownavigation: false});
     *     var s = board.create('slider', [[1, 2], [3, 2], [1, 5, 10]]);
     *   })();
     * </script><pre>
     * @example
     * // Create a slider taking integer values between 1 and 50. Initial value is 50.
     * var s = board.create('slider', [[1, 3], [3, 1], [1, 10, 50]], {snapWidth: 1});
     * </pre><div id="e17128e6-a25d-462a-9074-49460b0d66f4" style="width: 200px; height: 200px;"></div>
     * <script type="text/javascript">
     *   (function () {
     *     var board = JXG.JSXGraph.initBoard('e17128e6-a25d-462a-9074-49460b0d66f4', {boundingbox: [-1, 5, 5, -1], axis: true, showcopyright: false, shownavigation: false});
     *     var s = board.create('slider', [[1, 3], [3, 1], [1, 10, 50]], {snapWidth: 1});
     *   })();
     * </script><pre>
     */
    JXG.createSlider = function (board, parents, attributes) {
        var pos0, pos1, smin, start, smax, sdiff,
            p1, p2, l1, ticks, ti, startx, starty, p3, l2, n, t,
            withText, withTicks, snapWidth, attr, precision;

        pos0 = parents[0];
        pos1 = parents[1];
        smin = parents[2][0];
        start = parents[2][1];
        smax = parents[2][2];
        sdiff = smax - smin;

        attr = Type.copyAttributes(attributes, board.options, 'slider');
        withTicks = attr.withticks;
        withText = attr.withlabel;
        snapWidth = attr.snapwidth;
        precision = attr.precision;

        // start point
        attr = Type.copyAttributes(attributes, board.options, 'slider', 'point1');
        p1 = board.create('point', pos0,  attr);

        // end point
        attr = Type.copyAttributes(attributes, board.options, 'slider', 'point2');
        p2 = board.create('point', pos1,  attr);
        board.create('group', [p1, p2]);

        // slide line
        attr = Type.copyAttributes(attributes, board.options, 'slider', 'baseline');
        l1 = board.create('segment', [p1, p2], attr);

        // this is required for a correct projection of the glider onto the segment below
        l1.updateStdform();

        if (withTicks) {
            attr = Type.copyAttributes(attributes, board.options, 'slider', 'ticks');
            ticks  = 2;
            ti = board.create('ticks', [
                l1,
                p2.Dist(p1) / ticks,

                function (tick) {
                    var dFull = p1.Dist(p2),
                        d = p1.coords.distance(Const.COORDS_BY_USER, tick);

                    if (dFull < Mat.eps) {
                        return 0;
                    }

                    return d / dFull * sdiff + smin;
                }
            ], attr);
        }

        startx = pos0[0] + (pos1[0] - pos0[0]) * (start - smin) / (smax - smin);
        starty = pos0[1] + (pos1[1] - pos0[1]) * (start - smin) / (smax - smin);

        // glider point
        attr = Type.copyAttributes(attributes, board.options, 'slider');
        // overwrite this in any case; the sliders label is a special text element, not the gliders label.
        attr.withLabel = false;
        // gliders set snapwidth=-1 by default (i.e. deactivate them)
        p3 = board.create('glider', [startx, starty, l1], attr);
        p3.setAttribute({snapwidth: snapWidth});

        // segment from start point to glider point
        attr = Type.copyAttributes(attributes, board.options, 'slider', 'highline');
        l2 = board.create('segment', [p1, p3],  attr);

        p3.Value = function () {
            return p3.visProp.snapwidth === -1 ? this.position * sdiff + smin : Math.round((this.position * sdiff + smin) / this.visProp.snapwidth) * this.visProp.snapwidth;
        };

        p3.methodMap = Type.deepCopy(p3.methodMap, {
            Value: 'Value'
        });

        /**
         * End value of the slider range.
         * @memberOf Slider.prototype
         * @name _smax
         * @type Number
         */
        p3._smax = smax;

        /**
         * Start value of the slider range.
         * @memberOf Slider.prototype
         * @name _smin
         * @type Number
         */
        p3._smin = smin;

        if (withText) {
            if (attributes.name && attributes.name !== '') {
                n = attributes.name + ' = ';
            } else {
                n = '';
            }
            attr = Type.copyAttributes(attributes, board.options, 'slider', 'label');
            t = board.create('text', [
                function () {
                    return (p2.X() - p1.X()) * 0.05 + p2.X();
                },
                function () {
                    return (p2.Y() - p1.Y()) * 0.05 + p2.Y();
                },
                function () {
                    return n + (p3.Value()).toFixed(precision);
                }
            ], attr);

            /**
             * The text element to the right of the slider, indicating its current value.
             * @memberOf Slider.prototype
             * @name label
             * @type JXG.Text
             */
            p3.label.content = t;
        }

        /**
         * Start point of the base line.
         * @memberOf Slider.prototype
         * @name point1
         * @type JXG.Point
         */
        p3.point1 = p1;
        /**
         * End point of the base line.
         * @memberOf Slider.prototype
         * @name point2
         * @type JXG.Point
         */
        p3.point2 = p2;

        /**
         * The baseline the glider is bound to.
         * @memberOf Slider.prototype
         * @name baseline
         * @type JXG.Line
         */
        p3.baseline = l1;
        /**
         * A line on top of the baseline, indicating the slider's progress.
         * @memberOf Slider.prototype
         * @name highline
         * @type JXG.Line
         */
        p3.highline = l2;

        if (withTicks) {
            /**
             * Ticks give a rough indication about the slider's current value.
             * @memberOf Slider.prototype
             * @name ticks
             * @type JXG.Ticks
             */
            p3.ticks = ti;
        }

        // override the point's remove method to ensure the removal of all elements
        p3.remove = function () {
            if (withText) {
                board.removeObject(t);
            }

            board.removeObject(l2);

            if (withTicks) {
                l1.removeTicks(ti);
            }

            board.removeObject(l1);
            board.removeObject(p2);
            board.removeObject(p1);


            Point.Point.prototype.remove.call(p3);
        };

        p1.dump = false;
        p2.dump = false;
        l1.dump = false;
        l2.dump = false;

        p3.elType = 'slider';
        p3.parents = parents;
        p3.subs = {
            point1: p1,
            point2: p2,
            baseLine: l1,
            highLine: l2
        };

        if (withTicks) {
            ti.dump = false;
            p3.subs.ticks = ti;
        }

        return p3;
    };

    JXG.registerElement('slider', JXG.createSlider);

    return {
        createSlider: JXG.createSlider
    };
});