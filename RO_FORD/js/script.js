/**
 * 
 */
function init() {
    if (window.goSamples) goSamples();

    var $$ = go.GraphObject.make;

    var data = globalConfig.externalData;
    var launchBtn = document.getElementById("launchBtn"),
        resetBtn = document.getElementById("resetBtn"),
        fordSelect = document.getElementById("fordSelect");

    diagram = $$(go.Diagram, "diagramDiv", {
        // start everything in the middle of the viewport
        "initialContentAlignment": go.Spot.Center,
        // have mouse wheel events zoom in and out instead of scroll up and down
        "toolManager.mouseWheelBehavior": go.ToolManager.WheelZoom,
        // support double-click in background creating a new node
        "clickCreatingTool.archetypeNodeData": {
            numero: "x",
            lamda: 0,
            isCHO: false
        },
        // enable undo & redo
        "undoManager.isEnabled": true
    });

    diagram.layout = new go.LayeredDigraphLayout(); // initialise the layout
    diagram.model = new go.GraphLinksModel(data.nodeDataArray, data.linkDataArray);

    // define the Node template
    diagram.nodeTemplate =
        $$(go.Node, "Auto",
            new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
            // define the node's outer shape, which will surround the TextBlock
            $$(go.Shape, "Ellipse",
                {
                    fill: globalConfig.node.defaultColor,
                    parameter1: 20,  // the corner has a large radius
                    stroke: null,
                    desiredSize: new go.Size(globalConfig.node.size, globalConfig.node.size),
                    portId: "",  // this Shape is the Node's port, not the whole Node
                    fromLinkable: true,
                    fromLinkableSelfNode: true,
                    fromLinkableDuplicates: false,
                    toLinkable: true,
                    toLinkableSelfNode: false,
                    toLinkableDuplicates: true,
                    cursor: "pointer"
                },
                new go.Binding('fill', 'isCHO', function (s, obj) {
                    return s ? globalConfig.node.choColor : globalConfig.node.defaultColor;
                })
            ),
            $$(go.TextBlock,
                {
                    font: "bold 11pt helvetica, bold arial, sans-serif",
                    editable: true  // editing the text automatically updates the model data
                },
                new go.Binding("text", "key", function (s, obj) {
                    return "x" + Math.abs(s);
                }).makeTwoWay())
        );

    // unlike the normal selection Adornment, this one includes a Button
    diagram.nodeTemplate.selectionAdornmentTemplate =
        $$(go.Adornment, "Spot",
            $$(go.Panel, "Auto",
                $$(go.Shape, {
                    fill: null,
                    stroke: "blue",
                    strokeWidth: 2
                }),
                $$(go.Placeholder)  // a Placeholder sizes itself to the selected Node
            ),
            // the button to create a "next" node, at the top-right corner
            $$("Button",
                {
                    alignment: go.Spot.TopRight,
                    click: addNodeAndLink  // this function is defined below
                },
                $$(go.Shape, "PlusLine", { width: 6, height: 6 })
            ) // end button
        ); // end Adornment

    // clicking the button inserts a new node to the right of the selected node,
    // and adds a link to that new node
    function addNodeAndLink(e, obj) {
        var adornment = obj.part;
        var diagram = e.diagram;
        diagram.startTransaction("Add State");
        // get the node data for which the user clicked the button
        var fromNode = adornment.adornedPart;
        var fromData = fromNode.data;
        // create a new "State" data object, positioned off to the right of the adorned Node
        var toData = {
            numero: "x",
            lamda: 0,
            isCHO: false
        };
        var p = fromNode.location.copy();
        p.x += 200;
        toData.loc = go.Point.stringify(p);  // the "loc" property is a string, not a Point object
        // add the new node data to the model
        var model = diagram.model;
        model.addNodeData(toData);
        // create a link data from the old node data to the new node data

        var linkdata = {
            from: model.getKeyForNodeData(fromData),  // or just: fromData.id
            to: model.getKeyForNodeData(toData),
            value: "0",
            isCHO: false
        };
        // and add the link data to the model
        model.addLinkData(linkdata);
        // select the new Node
        var newnode = diagram.findNodeForData(toData);
        diagram.select(newnode);

        diagram.commitTransaction("Add State");
        // if the new node is off-screen, scroll the diagram to show the new node
        diagram.scrollToRect(newnode.actualBounds);
        // example change binding
    }

    // replace the default Link template in the linkTemplateMap
    diagram.linkTemplate =
        $$(go.Link,  // the whole link panel
            {
                curve: go.Link.Bezier,
                adjusting: go.Link.Stretch,
                reshapable: true,
                relinkableFrom: true,
                relinkableTo: true,
                toShortLength: 3
            },
            new go.Binding("points").makeTwoWay(),
            $$(go.Shape,  // the link shape
                {
                    strokeWidth: 1.5,                    
                    stroke : globalConfig.link.defaultColor
                },
                new go.Binding("stroke", 'isCHO', function (s, obj) {                    
                    return s ? globalConfig.link.choColor : globalConfig.link.defaultColor
                })
            ),
            $$(go.Shape,  // the arrowhead
                {
                    toArrow: "standard",
                    fill: globalConfig.arrow.fill,
                    stroke: globalConfig.arrow.stroke,
                }),
            $$(go.Panel, "Auto",
                $$(go.Shape,  // the label background, which becomes transparent around the edges
                    {
                        fill: "transparent",  
                        stroke: null                      
                    }
                ),
                $$(go.TextBlock, "0",  // the label text
                    {
                        stroke: globalConfig.link.labelColor,
                        textAlign: "center",
                        font: "11pt helvetica, arial, sans-serif",
                        margin: 4,
                        editable: true  // enable in-place editing
                    },
                    // editing the text automatically updates the model data
                    new go.Binding("text", "value").makeTwoWay()
                )
            )
        );


    /*
        Algo ford
     */
    function findNode(key) {
        return diagram.findNodeForKey(t.key);
    }

    function nexts(key) {
        var links = diagram.model.linkDataArray;
        var nodes = diagram.model.nodeDataArray;
        var list = [];
        links.map(function (e) {
            if (e.from == key) {
                nodes.map(function (n) {
                    if (n.key == e.to) {
                        list.push(n);
                    }
                });
            }
        });
        list.sort(function (a, b) {
            return Math.abs(a.key) > Math.abs(b.key);
        });
        return list;
    }

    function previous(key) {
        var links = diagram.model.linkDataArray;
        var nodes = diagram.model.nodeDataArray;
        var list = [];
        links.map(function (l) {
            if (l.to == key) {
                nodes.map(function (n) {
                    if (n.key == l.from) {
                        list.push(n);
                    }
                });
            }
        });
        return list;
    }

    function getArc(from, to) {
        var links = diagram.model.linkDataArray;
        return links.find(function (l) {
            return l.from == from && l.to == to;
        });
    }

    function getNode(key) {
        return diagram.model.nodeDataArray.find(function (n) {
            return n == key;
        });
    }

    function changeType(type) {
        var model = diagram.model;
        var nodes = model.nodeDataArray;
        if (nodes.length > 0) {
            switch (type) {
                case 'Min':
                    // seul nodes[0].lamda = 0;                    
                    setNodeLamda(nodes[0].key, 0);
                    for (var i = 1; i < nodes.length; i++) {
                        setNodeLamda(nodes[i].key, Infinity);
                    }
                    break;
                case 'Max':
                    for (var i = 0; i < nodes.length; i++) {
                        setNodeLamda(nodes[i].key, 0);
                    }
                    break;
                default:
                    console.warn("call to undefined type");
                    break;
            }
        }
    }

    function setNodeLamda(key, value) {
        var node = diagram.findNodeForKey(key);
        if (node) {
            node.data.lamda = value;
        }
    }

    function appendRow(object) {
        var row = document.createElement("tr");
        for (var e in object) {
            var td = document.createElement("td");
            td.innerHTML = object[e];
            row.appendChild(td);
        }
        document.getElementById("tableTrace").lastElementChild.appendChild(row);
    }

    function removeDoublons() {
        var model = diagram.model;
        var nodes = model.nodeDataArray; 
        for (var i = 0; i < nodes.length; i++) {
            var suivants = nexts(nodes[i].key);
            for (var j = 0; j < suivants.length; j++) {
                var arci = getArc(nodes[i].key, suivants[j].key);
                var arcj = getArc(suivants[j].key, nodes[i].key);
                if (arcj != undefined){
                    model.removeLinkData(arcj);
                }
            }
        }
    }

    function maximisation() {
        viderChemin();
        changeType('Max');
        removeDoublons();
        let model = diagram.model;
        let nodes = model.nodeDataArray;
        let links = model.linkDataArray;
        let i = 0, j = 0;
        let suivants = [];
        let lamdaj, out, arc, node, beforeSuivants, beforeNodes, beforeResult;
        while (i < nodes.length) {
            out = undefined;
            suivants = nexts(nodes[i].key);
            while (j < suivants.length) {
                arc = getArc(nodes[i].key, suivants[j].key);
                if (arc.value != null || arc.value != undefined || arc.value != 0) {
                    node = diagram.findNodeForData(suivants[j]);
                    if (Math.abs(nodes[i].key) > Math.abs(suivants[j].key)) { // si i > j
                        if ((suivants[j].lamda - nodes[i].lamda) < parseInt(arc.value)) {
                            beforeSuivants = suivants[j].lamda;
                            beforeNodes = nodes[i].lamda;
                            beforeResult = suivants[j].lamda - nodes[i].lamda
                            node.data.lamda = parseInt(arc.value) + parseInt(nodes[i].lamda);
                            lamdaj = `λ${Math.abs(suivants[j].key)}= λ${Math.abs(nodes[i].key)} + V(X${Math.abs(nodes[i].key)},X${Math.abs(suivants[j].key)})= ${beforeNodes}+${arc.value}= ${node.data.lamda}`;
                            out = Math.abs(suivants[j].key);
                            appendRow({
                                "i": Math.abs(nodes[i].key),
                                "j": Math.abs(suivants[j].key),
                                "lamdaRes": `λ${Math.abs(suivants[j].key)} - λ${Math.abs(nodes[i].key)} = ${beforeSuivants} - ${beforeNodes} = ${beforeResult}`,
                                "arcValue": arc.value,
                                "lamdaj": lamdaj
                            });
                            break;
                        }
                        else {
                            appendRow({
                                "i": Math.abs(nodes[i].key),
                                "j": Math.abs(suivants[j].key),
                                "lamdaRes": `λ${Math.abs(suivants[j].key)} - λ${Math.abs(nodes[i].key)} = ${suivants[j].lamda} - ${nodes[i].lamda} = ${suivants[j].lamda - nodes[i].lamda}`,
                                "arcValue": arc.value,
                                "lamdaj": ""
                            });
                        }
                    } else {
                        if (arc.value == undefined) {
                            arc.value = 0;
                            appendRow({
                                "i": Math.abs(nodes[i].key),
                                "j": Math.abs(suivants[j].key),
                                "lamdaRes": `λ${Math.abs(suivants[j].key)} - λ${Math.abs(nodes[i].key)} = ${suivants[j].lamda} - ${nodes[i].lamda} = ${suivants[j].lamda - nodes[i].lamda}`,
                                "arcValue": arc.value,
                                "lamdaj": lamdaj
                            }); 
                        }
                        else if (((suivants[j].lamda - nodes[i].lamda)) < parseInt(arc.value)) {
                            beforeSuivants = suivants[j].lamda;
                            beforeNodes = nodes[i].lamda;
                            beforeResult = suivants[j].lamda - nodes[i].lamda;
                            node.data.lamda = parseInt(arc.value) + parseInt(nodes[i].lamda);
                            lamdaj = `λ${Math.abs(suivants[j].key)}= λ${Math.abs(nodes[i].key)} + V(X${Math.abs(nodes[i].key)},X${Math.abs(suivants[j].key)})= ${beforeNodes}+${arc.value}= ${node.data.lamda}`;
                            appendRow({
                                "i": Math.abs(nodes[i].key),
                                "j": Math.abs(suivants[j].key),
                                "lamdaRes": `λ${Math.abs(suivants[j].key)} - λ${Math.abs(nodes[i].key)} = ${beforeSuivants} - ${beforeNodes} = ${beforeResult}`,
                                "arcValue": arc.value,
                                "lamdaj": lamdaj
                            });
                        }
                        else {
                            appendRow({
                                "i": Math.abs(nodes[i].key),
                                "j": Math.abs(suivants[j].key),
                                "lamdaRes": `λ${Math.abs(suivants[j].key)} - λ${Math.abs(nodes[i].key)} = ${suivants[j].lamda} - ${nodes[i].lamda} = ${suivants[j].lamda - nodes[i].lamda}`,
                                "arcValue": arc.value,
                                "lamdaj": ""
                            });
                        }
                    }
                    j++;
                } else {
                    return;
                }
            }
            lamdaj = "";
            out ? i = out - 1 : i++;
            j = 0;
        }
        cheminOptimal();
    }

    function minimisation() {
        viderChemin();
        changeType('Min');
        let model = diagram.model;
        let nodes = model.nodeDataArray;
        let links = model.linkDataArray;
        let i = 0, j = 0;
        let suivants = [];
        let lamdaj, out, arc, node, beforeSuivants, beforeNodes, beforeResult;
        while (i < nodes.length) {
            out = undefined;
            suivants = nexts(nodes[i].key);
            while (j < suivants.length) {
                arc = getArc(nodes[i].key, suivants[j].key);
                if (arc.value != null || arc.value != undefined || arc.value != 0) {
                    node = diagram.findNodeForData(suivants[j]);
                    if (Math.abs(nodes[i].key) > Math.abs(suivants[j].key)) { // si i > j
                        if ((suivants[j].lamda - nodes[i].lamda) > parseInt(arc.value)) {
                            beforeSuivants = isFinite(suivants[j].lamda)? suivants[j].lamda: "∞";
                            beforeNodes = nodes[i].lamda;
                            beforeResult = isFinite(suivants[j].lamda)? suivants[j].lamda - nodes[i].lamda : "∞";
                            node.data.lamda = parseInt(arc.value) + parseInt(nodes[i].lamda);
                            lamdaj = `λ${Math.abs(suivants[j].key)}= λ${Math.abs(nodes[i].key)} + V(X${Math.abs(nodes[i].key)},X${Math.abs(suivants[j].key)})= ${beforeNodes}+${arc.value}= ${node.data.lamda}`;
                            out = Math.abs(suivants[j].key);
                            appendRow({
                                "i": Math.abs(nodes[i].key),
                                "j": Math.abs(suivants[j].key),
                                "lamdaRes": `λ${Math.abs(suivants[j].key)} - λ${Math.abs(nodes[i].key)} = ${beforeSuivants} - ${beforeNodes} = ${beforeResult}`,
                                "arcValue": arc.value,
                                "lamdaj": lamdaj
                            });
                            break;
                        }
                        else {
                            appendRow({
                                "i": Math.abs(nodes[i].key),
                                "j": Math.abs(suivants[j].key),
                                "lamdaRes": `λ${Math.abs(suivants[j].key)} - λ${Math.abs(nodes[i].key)} = ${suivants[j].lamda} - ${nodes[i].lamda} = ${suivants[j].lamda - nodes[i].lamda}`,
                                "arcValue": arc.value,
                                "lamdaj": ""
                            });
                        }
                    } else {
                        if (arc.value == undefined) {
                            arc.value = 0;
                            appendRow({
                                "i": Math.abs(nodes[i].key),
                                "j": Math.abs(suivants[j].key),
                                "lamdaRes": `λ${Math.abs(suivants[j].key)} - λ${Math.abs(nodes[i].key)} = ${suivants[j].lamda} - ${nodes[i].lamda} = ${suivants[j].lamda - nodes[i].lamda}`,
                                "arcValue": arc.value,
                                "lamdaj": lamdaj
                            }); 
                        }
                        else if (((suivants[j].lamda - nodes[i].lamda)) > parseInt(arc.value)) {
                            beforeSuivants = isFinite(suivants[j].lamda)? suivants[j].lamda: "∞";
                            beforeNodes = nodes[i].lamda;
                            beforeResult = isFinite(suivants[j].lamda)? suivants[j].lamda - nodes[i].lamda : "∞";
                            node.data.lamda = parseInt(arc.value) + parseInt(nodes[i].lamda);
                            lamdaj = `λ${Math.abs(suivants[j].key)}= λ${Math.abs(nodes[i].key)} + V(X${Math.abs(nodes[i].key)},X${Math.abs(suivants[j].key)})= ${beforeNodes}+${arc.value}= ${node.data.lamda}`;
                            appendRow({
                                "i": Math.abs(nodes[i].key),
                                "j": Math.abs(suivants[j].key),
                                "lamdaRes": `λ${Math.abs(suivants[j].key)} - λ${Math.abs(nodes[i].key)} = ${beforeSuivants} - ${beforeNodes} = ${beforeResult}`,
                                "arcValue": arc.value,
                                "lamdaj": lamdaj
                            });
                        }
                        else {
                            appendRow({
                                "i": Math.abs(nodes[i].key),
                                "j": Math.abs(suivants[j].key),
                                "lamdaRes": `λ${Math.abs(suivants[j].key)} - λ${Math.abs(nodes[i].key)} = ${suivants[j].lamda} - ${nodes[i].lamda} = ${suivants[j].lamda - nodes[i].lamda}`,
                                "arcValue": arc.value,
                                "lamdaj": ""
                            });
                        }
                    }
                    j++;
                } else {
                    return;
                }
            }
            lamdaj = "";
            out ? i = out - 1 : i++;
            j = 0;
        }
        cheminOptimal();
    }

    function cheminOptimal() {
        var nodes = diagram.model.nodeDataArray;
        var s = lastNode();
        setCho(s, true); // set last node to cho
        while ((s != null) && (s.lamda != 0)) {
            var predececeurs = previous(s.key);
            for (var i = 0; i < predececeurs.length; i++) {
                var arc = getArc(predececeurs[i].key, s.key);
                var lamdap = parseInt(arc.value) + predececeurs[i].lamda;
                if (s.lamda === lamdap) {
                    setCho(predececeurs[i], true);
                    setCho(arc, true);
                    s = predececeurs[i];
                    break;
                }
            }
        }        
    }

    function setCho(graphElement, value) {
        diagram.startTransaction("CHO State");
        diagram.model.setDataProperty(graphElement, "isCHO", value); // change the node color
        diagram.startTransaction("CHO State");
    }

    function viderChemin() {
        diagram.model.nodeDataArray.forEach(function (c) {
            setCho(c, false);
        });
        diagram.model.linkDataArray.forEach(function (l) {
            setCho(l, false);
        });
        document.getElementById("tableTrace").lastElementChild.innerHTML = "";
    }

    function lastNode() {
        var i = diagram.model.nodeDataArray.length - 1;
        return diagram.model.nodeDataArray[i];
    }

    // event triggers
    launchBtn.addEventListener('click', function (e) {
        var select = document.getElementById("fordSelect");
        switch (select.value) {
            case "Max":
                maximisation();
                break;
            case "Min":
                minimisation();
                break;
        }
        
    }, false);
    resetBtn.addEventListener('click', function (e) {
        viderChemin();
    }, false);
    fordSelect.addEventListener('change', function (e) {
        switch (this.value) {
            case "Min":
                minimisation();
                break;
            case "Max":
                maximisation();
                break;
        }
    }, false);


    /**
     * Drag and drop 
     */
    var dropZoneId = "drop-zone";
    var buttonId = "clickHere";
    var mouseOverClass = "mouse-over";

    var dropZone = $("#" + dropZoneId);
    var ooleft = dropZone.offset().left;
    var ooright = dropZone.outerWidth() + ooleft;
    var ootop = dropZone.offset().top;
    var oobottom = dropZone.outerHeight() + ootop;
    var inputFile = dropZone.find("input");

    document.getElementById(dropZoneId).addEventListener("dragover", function (e) {
        e.preventDefault();
        e.stopPropagation();
        dropZone.addClass(mouseOverClass);
        var x = e.pageX;
        var y = e.pageY;

        if (!(x < ooleft || x > ooright || y < ootop || y > oobottom)) {
            inputFile.offset({
                top: y - 15,
                left: x - 100
            });
        } else {
            inputFile.offset({
                top: -400,
                left: -400
            });
        }

    }, true);

    if (buttonId != "") {
        var clickZone = $("#" + buttonId);

        var oleft = clickZone.offset().left;
        var oright = clickZone.outerWidth() + oleft;
        var otop = clickZone.offset().top;
        var obottom = clickZone.outerHeight() + otop;

        $("#" + buttonId).mousemove(function (e) {
            var x = e.pageX;
            var y = e.pageY;
            if (!(x < oleft || x > oright || y < otop || y > obottom)) {
                inputFile.offset({
                    top: y - 15,
                    left: x - 160
                });
            } else {
                inputFile.offset({
                    top: -400,
                    left: -400
                });
            }
        });
    }

    document.getElementById(dropZoneId).addEventListener("drop", function (e) {
        $("#" + dropZoneId).removeClass(mouseOverClass);
    }, true);

    var files_garbage = [];

    var getColor = function (value) {
        //value from 0 to 1
        var hue = ((1 - (value / 100)) * 120).toString(10);
        return ["hsl(", hue, ",100%,50%)"].join("");
    }

    inputFile.on('change', function (e) {
        $('#filename').html("");
        var files = this.files;
        var fileNum = this.files.length,
            initial = 0,
            counter = 0;
        files_garbage = files;
        for (initial; initial < fileNum; initial++) {
            counter = counter + 1;
            //Start change -- added div to append
            var list = '<div inputFileListIndex="' + initial + '" data-fe="">' +
                '<span class="fa-stack fa-lg"><i class="fa fa-file fa-stack-1x "></i>' +
                '<strong class="fa-stack-1x" style="font-size:12px; margin-top:2px;">' + counter + '</strong></span> '
                + this.files[initial].name + '&nbsp;&nbsp;' +
                '<span class="fa fa-eye fa-lg btnShow" title="show"></span>' +
                '<span class="fa fa-times-circle fa-lg closeBtn" title="remove"></span>' +
                '</div>';
            $('#filename').append(list);
            console.log(list);
            // append parsed file inside json_data                                        
        }

        $('#filename').find('.btnShow').click(function () {
            // find json_data parsed files by inputFileListIndex
            var index = $(this).parent().attr('inputFileListIndex');
            // add map.add.geoJSON                    
            var parent = $(this).parent();
            var reader = new FileReader();
            var hide = $(this).siblings('span.btnHide');
            var that = $(this);
            reader.onload = function (e) {
                // get file content                                                              
                result = e.target.result;
                if (result) {
                    // var temp = map.data.addGeoJson(parsed(result));                   
                    var result = JSON.parse(result);
                    var model = diagram.model;
                    model.nodeDataArray = result.nodeDataArray;
                    model.linkDataArray = result.linkDataArray;
                    // parent.data('fe', temp);
                    hide.removeClass('hidden');
                    that.addClass('hidden');
                } else {
                    console.log("error on result")
                }
            }
            reader.readAsText(files_garbage[index], "UTF-8");
        });

        $('#filename').find('.closeBtn').click(function () {
            var parent = $(this).parent();
            var fe = parent.data('fe');
            var model = diagram.model;
            model.nodeDataArray = [];
            model.linkDataArray = [];
            parent.remove();
        });
    });

    function isEquivalent(a, b) {
        var res = a === b
        return res;
    }

}
