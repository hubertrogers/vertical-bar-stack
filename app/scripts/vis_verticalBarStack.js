function verticalBarStack() {
    // **********************
    // Parameters for controlling the properties of the chart,
    // each has a chart.* accessfor function for get/set
    // **********************
    var containerID;
    var statusColors;
    var yValue;
    var nameValue;
    var maxCharLength = 22;
    var durationDefault = 1000;
    var width = 300;
    var minWidth = 300;
    var maxWidth = 500;
    var height = 700;
    var margin = {
        top: 80,
        right: 0,
        bottom: 30,
        left: 0
    };
    var footerHeight = 60;
    var minBarHeight = 10;
    var barWidth = 20;
    var barPad = 3;
    var textPad = 2;
    var y = d3.scale.linear()
        .range([0, height]);
    var fontSize = 12;
    var orientation = "left";
    var chartType = "";
    var tip;
    // **********************
    // The chart function
    // Selects a div (selection) and appends an SVG element with the graphics
    // **********************
    function chart(selection) {
        selection.each(function(data) {
            var svg = d3.select(this)
                .selectAll("svg")
                .data([data]);

            var gEnter = svg.enter()
                .append('svg')
                .attr("class", "BlinkersVerticalBarStack")
                .attr("width", width)
                .attr("height", height)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            svg.call(tip);

            // **********************
            // Update domains of scales based on new data
            // **********************
            updateHeight();
            y.domain([0, d3.sum(data, function(d) {
                return yValue(d);
            }) + barPad * data.length]);
            y.range([0, height]);

            data = data.sort(function(a, b) {
                return yValue(b) - yValue(a);
            });
            var y0 = 0;
            data.forEach(function(d) {
                d.y0 = y0;
                y0 = y0 + yValue(d) + barPad;
            });

            // **********************
            // Selections on new bars
            // **********************
            var bar = svg.selectAll(".bar")
                .data(data, function(d) {
                    return nameValue(d);
                });

            var barEnter = bar.enter()
                .insert("g", ".axis")
                .attr("class", "bar")
                .attr("fill-opacity", 0.8);

            barEnter.append("rect")
                .attr("width", 0)
                .attr("y", function(d) {
                    return y(d.y0);
                })
                .attr("x", function(d) {
                    if (orientation == 'left') {
                        return 0;
                    } else {
                        return width;
                    }
                })
                .attr("height", function(d, i) {
                    return y(yValue(d));
                })
                .on("mouseover.grow", grow)
                .on("mouseout.shrink", shrink)
                .on('mouseover.tooltip', tip.show)
                .on('mouseout.tooltip', tip.hide);

            barEnter.append("text")
                .attr("class", "label")
                .attr("x", function() {
                    if (orientation == 'left') {
                        return 0;
                    } else {
                        return width;
                    }
                })
                .attr("y", function(d) {
                    return y(d.y0) + y(yValue(d)) / 2;
                })
                .attr("dy", ".35em")
                .attr("text-anchor", function() {
                    if (orientation == "left") {
                        return "end";
                    } else {
                        return "start";
                    }
                })
                .text(function(d) {
                    return trimName(nameValue(d), maxCharLength);
                });

            // **********************
            // Selections on exiting bars
            // **********************
            var barExit = bar.exit()

            barExit.select("rect")
                .transition()
                // .delay(function(d, i) {
                //     return i * 20;
                // })
                .duration(1000)
                .attr("width", 0)
                .attr("x", function(d) {
                    if (orientation == 'left') {
                        return 0;
                    } else {
                        return width;
                    }
                })
                .attr("fill-opacity", 0)
                .remove();

            barExit.select("text")
                .transition()
                .delay(function(d, i) {
                    return i * 20;
                })
                .duration(1000)
                .attr("x", function(d) {
                    if (orientation == 'left') {
                        return 0;
                    } else {
                        return width;
                    }
                })

            barExit
                .transition()
                .delay(function(d, i) {
                    return i * 20;
                })
                .duration(1000)
                .attr("fill-opacity", 0)
                .remove();

            resize(durationDefault);

            d3.select(window)
                .on("resize.skills." + containerID, function() {
                    resize(durationDefault)
                });

            $('#redraw-skills, .go-to')
                .click(function() {
                    resize(0);
                });

            // **********************
            // Update selections - triggered on window resize and after initial load
            // ********************** 

            function updateHeight() {
                width = $("#" + containerID)
                    .width();
                height = $("#" + containerID)
                    .height() - margin.top - margin.bottom;
                if (!width) {
                    width = minWidth
                }
                if (!height) {
                    height = minHeight
                }

                // update y range
                y.range([0, height]);
            }

            function resize(durationCustom) {

                updateHeight();

                var barUpdate = bar;
                barUpdate.select("rect")
                    .transition()
                    .delay(function(d, i) {
                        return i * 50;
                    })
                    .duration(1000)
                    .attr("fill", function(d) {
                        if (d.color) {
                            return d.color;
                        } else {
                            return statusColors[d.type];
                        }
                    })
                    .attr("width", function(d) {
                        return barWidth;
                    })
                    .attr("y", function(d) {
                        return y(d.y0);
                    })
                    .attr("x", function(d) {
                        if (orientation == "left") {
                            return width - barWidth - barPad;
                        } else { // orientation == "right"
                            if (d.hasOwnProperty('user') && d.user == true) {
                                return barPad;
                            } else {
                                return width + barWidth + barPad; // == hidden
                            }
                        }
                    })
                    .attr("height", function(d, i) {
                        return y(yValue(d));
                    })
                    .attr('fill-opacity', function(d) {
                        if (orientation == "right" && d.hasOwnProperty('user') && d.user == false) {
                            return 0;
                        } else {
                            return 0.8;
                        }
                    });


                barUpdate.select("text")
                    .transition()
                    .delay(function(d, i) {
                        return i * 50;
                    })
                    .duration(1000)
                    .attr("style", "font-size:" + fontSize + "px;font-family:Oswald,Sans-serif;fill:black")
                    .attr("x", function(d) {
                        if (orientation == "left") {
                            return width - barWidth - barPad - textPad;
                        } else { // orientation == "right"
                            if (d.hasOwnProperty('user') && d.user == true) {
                                return barWidth + barPad + textPad;
                            } else {
                                return width + barWidth + barPad;
                            }
                        }
                    })
                    .attr("y", function(d) {
                        return y(d.y0) + y(yValue(d)) / 2;
                    })
                    .attr('fill-opacity', function(d) {
                        if (orientation == "right" && d.hasOwnProperty('user') && d.user == false) {
                            return 0;
                        } else {
                            return 0.8;
                        }
                    });

            }
            // **********************
            // Misc Methods
            // ********************** 
            function trimName(fullName, maxLength) {
                var trimmedName = fullName.replace(/\(.*?\)/, "");
                if (trimmedName.length > maxLength) {
                    trimmedName = trimmedName.substr(0, maxLength - 3) + "..."
                }
                return trimmedName;
            }

            function grow() {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("x", function(d) {
                        if (orientation == "left") {
                            return width - barWidth - barPad;
                        } else { // orientation == "right"
                            if (d.hasOwnProperty('user') && d.user == true) {
                                return barPad - barPad;
                            } else {
                                return width + barWidth + barPad;
                            }
                        }
                    })
                    .attr("width", barWidth + barPad)
                    .attr('fill-opacity', 1)
            }

            function shrink() {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("x", function(d) {
                        if (orientation == "left") {
                            return width - barWidth - barPad;
                        } else { // orientation == "right"
                            if (d.hasOwnProperty('user') && d.user == true) {
                                return barPad;
                            } else {
                                return width + barWidth + barPad;
                            }
                        }
                    })
                    .attr("width", barWidth)
                    .attr('fill-opacity', 0.8)
            }

        });

    };

    // **********************
    // Accessor methods
    // ********************** 

    chart.containerID = function(_) {
        if (!arguments.length) return containerID;
        containerID = _;
        return chart;
    };
    chart.yValue = function(_) {
        if (!arguments.length) return yValue;
        yValue = _;
        return chart;
    };
    chart.nameValue = function(_) {
        if (!arguments.length) return nameValue;
        nameValue = _;
        return chart;
    };
    chart.statusColors = function(_) {
        if (!arguments.length) return statusColors;
        statusColors = _;
        return chart;
    };
    chart.maxCharLength = function(_) {
        if (!arguments.length) return maxCharLength;
        maxCharLength = _;
        return chart;
    };
    chart.durationDefault = function(_) {
        if (!arguments.length) return maxCharLength;
        maxCharLength = _;
        return chart;
    };
    chart.chartType = function(_) {
        if (!arguments.length) return chartType;
        chartType = _;
        return chart;
    };
    chart.orientation = function(_) {
        if (!arguments.length) return orientation;
        orientation = _;
        return chart;
    };
    chart.margin = function(_) {
        if (!arguments.length) return margin;
        margin = _;
        return chart;
    };
    chart.tip = function(_) {
        if (!arguments.length) return tip;
        tip = _;
        return chart;
    };
    return chart;
}