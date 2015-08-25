function vennChart() {
    // **********************
    // Parameters for controlling the properties of the chart,
    // each has a chart.* accessfor function for get/set
    // **********************
    var width = 900,
        minWidth = 500,
        mobileTreshold = 700,
        height = 520,
        padding = 6, // separation between nodes
        minRadius = 16,
        maxRadius = 60,
        m = 3, // number of node clusters
        maxCharLengthDesktop = 22,
        maxCharLengthMobile = 14,
        durationDefault = 1000,
        margin = {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
        };

    var lastState = 'desktop';
    var initialState = true;
    var rectLabelLengthDesktop = 100;
    var rectLabelLengthMobile = 75;
    var maxCharLength = maxCharLengthDesktop;
    var colorRange = [colorbrewer['Greens']['9'][4], colorbrewer['YlOrRd']['9'][2], colorbrewer['Reds']['9'][4]];
    var color = d3.scale.ordinal()
        .domain(d3.range(m));
    var xVenn = d3.scale.ordinal()
        .domain(d3.range(m))
        .rangeBands([0, width]);

    var data;
    var setLabels = ["Skills jobseekers have", "Skills in common", "Skills employers want"];

    var skillLookup = {};

    var minRadiusWidthScale = d3.scale.pow(2)
        .domain([minWidth, width])
        .range([minRadius, 25])
        .clamp(true)
    var maxRadiusWidthScale = d3.scale.pow(2)
        .domain([minWidth, width])
        .range([35, maxRadius])
        .clamp(true)
    var maxCharLengthWidthScale = d3.scale.linear()
        .domain([minWidth, width])
        .range([maxCharLengthMobile, maxCharLengthDesktop])
        .clamp(true)

    // **********************
    // The chart function 
    // Selects a div element (selection) and appends an SVG with the horizontal bar chart
    // **********************
    function chart(selection) {

        // **********************
        // handing new personalized data
        // **********************        

        data.forEach(function(d) {
            skillLookup[d.skill_name] = d;
        });

        color
            .range(colorRange);

        selection.each(function() {

            var svg = d3.select(this)
                .append("svg")
                .attr("width", width)
                .attr("height", height)
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


            // **********************
            // Update domains of color scale based on the data
            // **********************
            var radiusScale = d3.scale.linear()
                .domain([d3.min(data, function(d) {
                    return trimName(d.skill_name)
                        .length;
                }), d3.max(data, function(d) {
                    return trimName(d.skill_name)
                        .length;
                })])
                .range([minRadius, maxRadius]);

            // **********************
            // Make an array of the nodes, with attributes for feeding into force layout
            // ********************** 
            var nodes = d3.range(data.length)
                .map(function(i) {
                    var node = data[i];
                    node.radius = radiusScale(trimName(node.skill_name)
                        .length);
                    node.color = color(node.set);
                    node.cx = xVenn(node.set) + (width / 6);
                    node.cy = height / 2;
                    node.name = node.skill_name;
                    return node;
                });

            // **********************
            // Make force layout
            // ********************** 
            var force = d3.layout.force()
                .nodes(nodes)
                .size([width, height])
                .gravity(0)
                .charge(function(d) {
                    return -Math.pow(d.radius, 2.0) / 8;
                })
                .friction(0.9)
                .on("tick", tick)
                .start();

            // **********************
            // Function for retrieving the properties of each set of nodes
            // ********************** 
            var venn = color.range()
                .map(function(d, i) {
                    return {
                        radius: Math.sqrt(50) * maxRadius,
                        color: d,
                        set: i
                    };
                });

            var vennCircles = svg.selectAll("g.vennCircle")
                .data(venn)
                .enter()
                .append('g')


            // **********************
            // Show as legend labels for the three categories of nodes
            // ********************** 
            var vennLabels = vennCircles.append('g')
                .attr("transform", function(d, i) {
                    return "translate(" + (xVenn(i) + width / 6) + "," + 20 + ")";
                });

            var vennText = vennLabels.append("text")
                .attr('class', 'vennLabel')
                .attr("text-anchor", "middle")
                .text(function(d) {
                    return setLabels[d.set]
                })
                .style("font-size", "16px")
                .attr("fill-opacity", 1)
                .attr("dy", ".35em")

            vennLabels.append("rect")
                .style("fill", function(d) {
                    return d.color;
                })
                .attr("opacity", 1)
                .attr("height", 10)
                .attr("width", 200)
                .attr("rx", 3)
                .attr("ry", 3)


            // **********************
            // Show as legend the percentage of matching node elements
            // ********************** 
            var count_left = 0;
            var count_right = 0;
            var count_overlap = 0;
            for (var i = 0; i < data.length; i++) {
                if (data[i].set == 1) {
                    count_overlap++;
                } else if (data[i].set == 0) {
                    count_left++;
                } else if (data[i].set == 2) {
                    count_right++;
                }
            }

            var vennMatch = svg.append('g')
                .attr("transform", function(d, i) {
                    return "translate(" + (xVenn(1) + width / 6) + "," + height + ")";
                });

            vennMatch.append('text')
                .attr("x", 0)
                .attr("y", 0)
                .attr("dy", ".35em")
                .style("font-size", "20px")
                .text(function(d) {
                    return pcFormat(count_overlap / data.length) + " skills match"
                })
                .attr("transform", function(d, i) {
                    return "translate(" + 0 + "," + (-20) + ")";
                });

            vennMatch.append("rect")
                .style("fill", function(d) {
                    return color.range()[1];
                })
                .attr("fill-opacity", 1)
                .attr("opacity", 1)
                .attr("height", 10)
                .attr("width", 200)
                .attr("rx", 3)
                .attr("ry", 3)
                .attr("x", 0)
                .attr("y", 0)
                .attr("transform", function(d, i) {
                    return "translate(" + (-100) + "," + (-10) + ")";
                })


            // **********************
            // D3 Tip Tooltip for hover over info
            // ********************** 
            var tip = d3.tip()
                .attr('class', 'd3-tip')
                .offset([-10, 0])
                .html(function(d) {
                    var format = d3.format(".3s")
                    if (d.set == 0) {
                        if (!d.resume_skills_percentage) {
                            return "<strong>" + d.skill_name + "</strong>";
                        }
                        return "<strong>" + d.skill_name + ":</strong> " +
                            "<p><span style='color:red'>" + d.resume_skills_percentage + "</span>" +
                            "<span style=''> of jobseekers have this skill</span>";
                    } else if (d.set == 1) {
                        if (!d.resume_skills_percentage) {
                            var text = "<strong>" + d.skill_name + ":</strong> " +
                                "<br><span style='color:red'> " + skillLookup[d.skill_name].job_skills_percentage + "</span> " +
                                "<span style=''> of jobseekers look for this skill</span>";
                            return text;
                        }
                        var text = "<strong>" + d.skill_name + ":</strong> <br>" +
                            "<span style='color:red'>" + skillLookup[d.skill_name].job_skills_percentage + "</span>" +
                            "<span style=''> of jobseekers have this skill </span> <br>" +
                            "<span style='color:red'> " + skillLookup[d.skill_name].resume_skills_percentage + "</span> " +
                            "<span style=''> of employers look for this skill</span>";
                        return text;
                    } else {
                        return "<strong>" + d.skill_name + ":</strong> <p>" +
                            "<span style='color:red'>" + d.job_skills_percentage + "</span>" +
                            "<span style=''> of employers look for this skill</span>";
                    }
                })
                .direction('s')

            svg.call(tip);

            function resetHighlighting() {
                labels
                    .text(function(d) {
                        return trimName(d.name);
                    })
                    .transition()
                    .duration(200)
                    .style("font-size", function(d) {
                        return d.scale + "px";
                    })
                    .attr('fill-opacity', 1)
            }

            // **********************
            // Add the nodes as circles, with text
            // ********************** 
            var gnodes = svg.selectAll("gnode")
                .data(nodes)
                .enter()
                .append('g')
                .attr("class", function(d) {
                    return "gnode " + d.set;
                })
                .on('mouseover', function(d) {
                    svg.selectAll(".gnode")
                        .sort(function(a, b) { // select the parent and sort the path's
                            if (a.skill_name != d.skill_name) return -1; // a is not the hovered element, send "a" to the back
                            else return 1; // a is the hovered element, bring "a" to the front
                        });

                    var currentFontSize = d3.select(this)
                        .select('text')
                        .style('font-size');
                    currentFontSize = parseFloat(currentFontSize);
                    if (currentFontSize < 18) {
                        d3.select(this)
                            .select('text')
                            .transition()
                            .duration(200)
                            .text(function(d) {
                                return d.name.replace(/\(.*?\)/, "");
                            })
                            .style('font-size', "18px");
                    }
                })
                .on('mouseout', function() {
                    resetHighlighting();
                })
                .call(force.drag);



            var circle = gnodes.append("circle")
                .attr('fill-opacity', 0)
                .attr("r", 0)
                .attr("stroke-opacity", 0)
                .style("fill", function(d) {
                    return d.color;
                })
                .on('mouseover', tip.show)
                .on('mouseout', tip.hide);

            circle.transition()
                .duration(durationDefault)
                .attr("r", function(d) {
                    return d.radius;
                });

            var labels = gnodes.append("text")
                .text(function(d) {
                    return trimName(d.name);
                })
                .style("font-size", "1px")
                .attr('fill-opacity', 1)

            circle
                .attr('fill-opacity', 0.8)

            function tick(e) {
                gnodes
                    .each(gravity(.2 * e.alpha))
                    .each(collide(.5))
                gnodes.attr("transform", function(d) {
                    if (!d.x) {
                        d.x = 0;
                    }
                    if (!d.y) {
                        d.y = 0;
                    }
                    return 'translate(' + [d.x, d.y] + ')';
                });
            }

            // Move nodes toward cluster focus.
            function gravity(alpha) {
                return function(d) {
                    d.y += (d.cy - d.y) * alpha;
                    d.x += (d.cx - d.x) * alpha;

                    d.x = Math.max((d.radius + 1), Math.min(width - d.radius, d.x));
                    d.y = Math.max((d.radius + 1), Math.min(height - d.radius, d.y));
                };
            }

            function collide(alpha) {
                var quadtree = d3.geom.quadtree(data);
                return function(d) {
                    var r = d.radius + maxRadius + padding,
                        nx1 = d.x - r,
                        nx2 = d.x + r,
                        ny1 = d.y - r,
                        ny2 = d.y + r;
                    quadtree.visit(function(quad, x1, y1, x2, y2) {
                        if (quad.point && (quad.point !== d)) {
                            var x = d.x - quad.point.x,
                                y = d.y - quad.point.y,
                                l = Math.sqrt(x * x + y * y),
                                r = d.radius + quad.point.radius + padding;
                            if (l < r) {
                                l = (l - r) / l * alpha;
                                d.x -= x *= l;
                                d.y -= y *= l;
                                quad.point.x += x;
                                quad.point.y += y;
                            }
                        }
                        return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
                    });
                };
            }

            resize(durationDefault);

            d3.select(window)
                .on("resize.skillsGap", function() {
                    resize(durationDefault)
                });

            $('#redraw-skills, .go-to')
                .click(function() {
                    resize(0);
                    updateLabels(0);
                    tip.hide();
                });

            function updateLabels(durationCustom, delayCustom) {
                setTimeout(function() {
                    labels
                        .attr('fill-opacity', 0)
                        .text(function(d) {
                            return trimName(d.name);
                        })
                        .style("font-size", function(d) {
                            if (d['font-size'] == "1px") {
                                return d['font-size']
                            }
                            return "1px";
                        })

                    .each(getSize)
                }, delayCustom)

                setTimeout(function() {
                    labels
                        .transition()
                        .duration(durationCustom)
                        .attr('fill-opacity', 1)
                        .style("font-size", function(d) {
                            return d.scale + "px";
                        })
                        .attr("dy", ".35em")

                }, delayCustom)
            }
            // **********************
            // Update visualization width in response to changing window width
            // ********************** 
            function resize(durationCustom) {
                var changedState = false;
                // update width
                width = $('#skills')
                    .width();
                if (!width) {
                    width = minWidth
                }
                tip.offset(function(d) {
                    return [0, 0]
                })

                if (width < mobileTreshold) { // true = mobile
                    changedState = (lastState == "desktop" ? true : false);
                    lastState = "mobile";
                } else { // true = desktop
                    changedState = (lastState == "mobile" ? true : false);
                    lastState = "desktop";
                }

                maxCharLength = maxCharLengthWidthScale(width);
                radiusScale
                    .domain([d3.min(data, function(d) {
                        return trimName(d.skill_name)
                            .length;
                    }), d3.max(data, function(d) {
                        return trimName(d.skill_name)
                            .length;
                    })])
                    .range([minRadiusWidthScale(width), maxRadiusWidthScale(width)]);

                vennLabels
                    .selectAll("rect")
                    .transition()
                    .duration(durationCustom)
                    .attr("width", function() {
                        if (width < mobileTreshold) {
                            return 75;
                        } else {
                            return 100;
                        }
                    })
                    .attr('transform', function(d, i) {
                        if (width < mobileTreshold) {
                            if (d.set == 1) {
                                return "translate(" + (-rectLabelLengthMobile / 2) + ",-10)";
                            } else {
                                return "translate(" + (-rectLabelLengthMobile / 2) + ",10)";
                            }
                        } else {
                            return "translate(" + (-rectLabelLengthDesktop / 2) + "," + (0) + ")";
                        }
                    });
                vennLabels
                    .selectAll("text")
                    .transition()
                    .duration(durationCustom)
                    .attr('transform', function(d, i) {
                        if (width < mobileTreshold) {
                            if (d.set == 1) {
                                return "translate(0,10)";
                            } else {
                                return "translate(0,30)";
                            }
                        } else {
                            return "translate(" + 0 + "," + (-10) + ")";
                        }
                    });

                xVenn.rangeBands([0, width]);
                nodes = d3.range(data.length)
                    .map(function(i) {
                        var node = data[i];
                        node.radius = radiusScale(trimName(data[i].skill_name)
                            .length);
                        node.color = color(node.set);
                        node.cx = xVenn(node.set) + (width / 6);
                        node.cy = height / 2;
                        node.name = node.skill_name;
                        return node;
                    });
                svg.attr("width", width);

                circle.transition()
                    .duration(durationCustom)
                    .attr("r", function(d) {
                        return d.radius;
                    });

                //  update labels
                updateLabels(durationCustom, durationCustom);

                force.nodes(nodes)
                    .size([width, height])
                    .resume();

                vennLabels
                    .attr("transform", function(d, i) {
                        if (d.set == 0) {
                            return "translate(" + (xVenn(i) + width / 6 + 10) + "," + 20 + ")";
                        } else if (d.set == 2) {
                            return "translate(" + (xVenn(i) + width / 6 - 10) + "," + 20 + ")";
                        } else {
                            return "translate(" + (xVenn(i) + width / 6) + "," + 20 + ")";
                        }
                    });

                vennMatch
                    .attr("transform", function(d, i) {
                        return "translate(" + (xVenn(1) + width / 6) + "," + height + ")";
                    });

                initialState = false;
            }
        });

    };

    function trimName(fullName) {
        var trimmedName = fullName.replace(/\(.*?\)/, "");
        if (trimmedName.length > maxCharLength) {
            trimmedName = trimmedName.substr(0, maxCharLength - 3) + "..."
        }
        return trimmedName;
    }

    function getSize(d) {
        var bbox = this.getBBox(),
            cbbox = this.parentNode.getBBox(),
            // scale = Math.min(cbbox.width / bbox.width, cbbox.height / bbox.height);
            scale = Math.min((d.radius * 2) / bbox.width, cbbox.height / bbox.height);
        d.scale = scale - 1;
    }

    // **********************
    // Getter and setter methods
    // ********************** 
    chart.data = function(_) {
        if (!arguments.length) return data;
        data = _;
        return chart;
    };
    chart.setLabels = function(_) {
        if (!arguments.length) return setLabels;
        setLabels = _;
        return chart;
    };
    chart.colorRange = function(_) {
        if (!arguments.length) return colorRange;
        colorRange = _;
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
    return chart;
}
