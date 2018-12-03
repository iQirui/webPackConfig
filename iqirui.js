
(function (global, factory) {
    "use strict";
    if (typeof module === "object" && typeof module.exports === "object") {
        module.exports = global.document ?
            factory(global, true) :
            function (w) {
                if (!w.document) {
                    throw new Error("jQuery requires a window with a document");
                }
                return factory(w);
            };
    } else {
        factory(global);
    }

})(typeof window !== "undefined" ? window : this, function (window, noGlobal) {
    var loadingCount = 0;
    var i18nObj;


    var iqiruiDAtaBaseDB;
    function getObjectStore(table, tart) {
        var store = null;
        try {
            //2-返回一个事务对象,indexDB 数据库只有  readwrite 以及readonly两个可爱的状态。 
            // var tt = iqiruiDAtaBaseDB.transaction([table], "readwrite");
            //3-objectStore方法用于返回指定的对象仓库(数据库表格)对象。 
            // var store = tt.objectStore(table);
            store = iqiruiDAtaBaseDB.transaction([table], tart).objectStore(table);
        } catch (error) {
            return getReturnObj(store, -1, error.message, error.code);
        }
        return getReturnObj(store, 0, null, null);
    }

    function getReturnObj(data, status, message, code, name) {
        return {
            data: data,
            message: message,
            status: status,
            code: code || 0
        }
    }

    function ajax(op) {
        var options = Object.assign({
            type: "GET",
            async: true,
            success: function (result) {
            }
        }, op)
        var xhr = null;
        if (window.XMLHttpRequest) {
            xhr = new XMLHttpRequest()
        } else {
            xhr = new ActiveXObject("Microsoft.XMLHTTP");
        }
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                var contentType = xhr.getResponseHeader("Content-Type");
                if (contentType.indexOf("json") == -1) {
                    options.success(xhr.responseText);
                } else {
                    try {
                        options.success(JSON.parse(xhr.responseText));
                    } catch{
                        options.success(xhr.responseText);
                    }
                }
            }
        }
        if (options.type == "GET") {
            xhr.open(options.type, options.url, options.async);
            xhr.send(null)
        } else if (options.type == "POST") {
            xhr.open(options.type, options.url, options.async);
            // xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            xhr.setRequestHeader("Content-Type", "application/json");
            if (options.data) {
                xhr.send(JSON.stringify(options.data));
            }
        }
        function formsParams(data) {
            var arr = [];
            for (var prop in data) {
                arr.push(prop + "=" + data[prop]);
            }
            return arr.join("&");
        }

    }

    function createScript(data) {
        var script = document.createElement("script");
        script.text = data;
        document.head.appendChild(script).parentNode.removeChild(script);
    }

    function loadJavaScript(options) {
        ajax({
            url: options.url,
            async: options.async !== false,
            type: options.type || "GET",
            success: function (data) {
                createScript(data);
                options.success && options.success(data);
            }
        })
    }


    var TQR = {
        loading: function (userId) {
            loadingCount++;
            var loadingNode = document.getElementById("qr_loading");
            if (loadingNode) {
                userId && loadingNode.setAttribute("userId", userId)
                return;
            }
            loadingNode = document.createElement("div");
            loadingNode.setAttribute("id", "qr_loading");
            userId && loadingNode.setAttribute("userId", userId)
            loadingNode.innerHTML = "loading";
            document.body.appendChild(loadingNode);
            setTimeout(function () {
                loadingNode.classList.add("qr_ui_fadeInAndOut");
            }, 30)
        },
        unLoading: function (userId, isDelete) {
            loadingCount--;
            var loadingNod = document.getElementById("qr_loading");
            if (!loadingNod) {
                loadingCount = 0;
                return;
            }
            var nodeUserId = loadingNod.getAttribute("userId");
            if (
                isDelete ||
                (nodeUserId && nodeUserId == userId && loadingCount <= 0) ||
                (!nodeUserId && loadingCount <= 0)
            ) {
                loadingCount = 0;
                loadingNod.parentNode.removeChild(loadingNod);
            }
        },
        getPageParameters: function () {
            var hash = location.hash;
            var hashArr = hash.split("?");
            var pageParameters = {};
            for (var i = 0; i < hashArr.length; i++) {
                var item = hashArr[i].split("=");
                if (item.length == 2) {
                    pageParameters[item[0]] = item[1]
                }
            }
            if (hashArr[0].split("#")[1]) {
                pageParameters.html = hashArr[0].split("#")[1];
            }
            return pageParameters;
        },
        loadHtml: function (dom, htmlUrl, isChangeHash, callback) {
            ajax({
                url: htmlUrl,
                type: "GET",
                async: false,
                success: function (data) {
                    dom.innerHTML = data;
                    //dom.appendChild(document.createRange().createContextualFragment(xmlhttp.responseText));
                    var scriptNode = dom.getElementsByTagName("script");
                    for (var i = 0; i < scriptNode.length; i++) {
                        if (scriptNode[i].src) {
                            loadJavaScript({ url: scriptNode[i].src, async: scriptNode[i].async });
                        } else {
                            createScript(s[i].text)
                        }
                    }
                    callback && callback();
                }
            })
            if (isChangeHash) {
                location.hash = htmlUrl;
            }
        },
        getObject: function (str, obj) {
            if (str) {
                var curentObj = obj || window;
                str = str.split(".");
                var stringLength = str.length;
                if (stringLength > 1) {
                    for (var i = 0; i < stringLength; i++) {
                        curentObj = curentObj[str[i]];
                        if (curentObj == null) {
                            return curentObj;
                        }
                    }
                    return curentObj;
                } else {
                    return curentObj[str[0]]
                }
            }
        },
        setObject: function (str, obj, value) {
            if (str) {
                var $obj = obj || window;
                var strArr = str.split(".");
                var temp1;
                var len = strArr.length;
                var target;
                var name;
                if (len > 1) {
                    len--;
                    temp1 = $obj;
                    for (var i = 0; i < len; i++) {
                        name = strArr[i];
                        target = temp1[name];
                        if (target == null) {
                            target = temp1[name] = {};
                        }
                        temp1 = target;
                    }
                    temp1[strArr[len]] = value;
                } else {
                    $obj[strArr[0]] = value;
                }
                return $obj;
            }
        },
        getI18n: function (key) {
            if (!i18nObj) {
                ajax({
                    url: './services/getI18n?language=en',
                    async: false,
                    type: "GET",
                    success: function (data) {
                        i18nObj = data || {};
                    }
                })
            }
            return i18nObj[key] || key;
        },
        ajax: function (op) {
            ajax(op)
        },
        UI: {
            dialog: function (args) {
                args = args || {};
                var box = document.createElement("div");
                box.classList.add("qr_ui_topBox");
                var style = box.style;
                var height = args.height || 200;
                var width = args.width || 400;
                style.width = (Number(width) ? width + "px" : "auto");
                style.height = (Number(height) ? height + "px" : "auto");

                var titleNode = document.createElement("div");
                titleNode.innerHTML = args.title || "提示";
                titleNode.classList.add("qr_ui_topBox_title");
                box.appendChild(titleNode)

                var contentNode = document.createElement("div");
                contentNode.classList.add("qr_ui_topBox_content");
                contentNode.appendChild(document.createRange().createContextualFragment(args.content || ""));
                box.appendChild(contentNode);

                if (args.butns) {
                    var butns = args.butns;
                    var foot = document.createElement("div");
                    foot.classList.add("qr_ui_topBox_foot");
                    for (var i = 0; i < butns.length; i++) {
                        var s = document.createElement("span");
                        s.innerText = butns[i].text;
                        s.addEventListener("click", butns[i].click)
                        foot.appendChild(s);
                    }
                    box.appendChild(foot)
                }
                document.body.appendChild(box);

                style.top = (window.innerHeight - box.offsetHeight) / 2 + "px";
                style.left = (window.innerWidth - box.offsetWidth) / 2 + "px";
                box.classList.add("qr_ui_fadeInAndOut");
                if (!args.butns) {
                    setTimeout(function () {
                        box.classList.remove("qr_ui_fadeInAndOut");
                    }, 2500)
                    setTimeout(function () {
                        document.body.removeChild(box);
                    }, 3000);
                }
                return {
                    close: function () {
                        document.body.removeChild(box);
                    }
                }
            },
            /**
            *
            * @param options
            * targetElement:目标元素，需要改变宽高的元素
            * currentElement：触发元素（绑定方法的元素）
            * minWidth：最小宽度
            * minHeight：最小高度
            * moveCallback：拖拽时的回调
            * afterCallback：拖拽完成后的回调
            * dropType：拖拽改变大小的类型（数组[]）"width"（只改变宽度）,height（只改变高度）,both（同时改变宽和高）
            */
            drop: function (options) {
                var targetElement = options.targetElement;
                var currentElement = options.currentElement;
                var minWidth = options.minWidth || 0;
                var minHeight = options.minHeight || 0;
                var moveCallback = options.moveCallback;
                var afterCallback = options.afterCallback;
                var dropType = options.dropType || ["both"];
                var type = 1;
                // if (dropType.contains("both") || (dropType.contains("width") && dropType.contains("height"))) {
                //     currentElement.css("cursor", "nw-resize");
                //     type = 3;
                // } else if (dropType.contains("width")) {
                //     currentElement.css("cursor", "w-resize");
                //     type = 1
                // } else if (dropType.contains("height")) {
                //     currentElement.css("cursor", "n-resize");
                //     type = 2
                // }
                function mouseDown(ev) {
                    debugger
                    var windowWidth = window.innerWidth;
                    var windowScrollLeft = $(window).scrollLeft();
                    var windowScrollTop = $(window).scrollTop();
                    var oEvent = ev;
                    // var left = targetElement.offset().left - windowScrollLeft;
                    // var top = targetElement.offset().top - windowScrollTop;
                    var left=0;
                    var top=0;
                    var right = 0//targetElement.outerWidth() + left - oEvent.clientX;
                    if (currentElement.setCapture) {
                        currentElement.addEventListener("mousemove",move);
                        currentElement.addEventListener("mouseup",mup);
                        currentElement.setCapture();
                    } else {
                        document.addEventListener("mousemove",move);
                        document.addEventListener("mouseup",mup);
                    }
                    function mup() {
                        if (currentElement.releaseCapture) {
                            currentElement.releaseCapture();
                        }
                        this.removeEventListener("mousemove",move)
                        this.removeEventListener("mouseup",mup)
                        if (afterCallback) {
                            afterCallback();
                        }
                    }

                    function move(ev) {
                        var oEvent = ev;
                        var width = oEvent.clientX - left + right;
                        if (width < 3) {
                            width = 3;
                        }
                        else if (width > windowWidth - left) {
                            width = windowWidth - left;
                        }
                        document.getElementById("qr_iqiruiJsAPI_left").style.flex = width / windowWidth * 100 + '%';
                        document.getElementById("qr_iqiruiJsAPI_right").style.flex = (windowWidth - width) / windowWidth * 100 + '%';
                        if (moveCallback) {
                            moveCallback();
                        }
                    }
                    return false;
                }
                currentElement.style.cursor='w-resize'
                currentElement.removeEventListener("mousedown",mouseDown);
                currentElement.addEventListener("mousedown",mouseDown);
            }

        },
        indexDB: {
            dbVersion: 20,
            createindexDB: function () {
                var openRequest = window.indexedDB.open("iqiruiDataBase", 50);
                openRequest.onupgradeneeded = function (e) {
                    iqiruiDAtaBaseDB = e.target.result;
                    var storeNames = iqiruiDAtaBaseDB.objectStoreNames;
                    var allTable = [
                        "qirui"
                    ]
                    for (var i = 0; i < allTable.length; i++) {
                        if (!storeNames.contains(allTable[i])) {
                            iqiruiDAtaBaseDB.createObjectStore(allTable[i], {
                                keyPath: "id"
                            })

                        }
                    }
                }
                openRequest.onsuccess = function (e) {
                    iqiruiDAtaBaseDB = e.target.result;
                }
                openRequest.onerror = function (e) {
                }
            }(),
            add: function (table, key, data, callback) {

                var storeObj = getObjectStore(table, "readwrite");
                if (storeObj.status != 0) {
                    callback && callback(getReturnObj(null, -1, storeObj.message, null));
                    return;
                }
                var store = storeObj.data;
                var request = store.add({ id: key, data: data });
                request.onerror = function (e) {
                    callback && callback(getReturnObj(null, -1, "add failed"));
                }
                request.onsuccess = function (e) {
                    callback && callback(getReturnObj(null, 0, null));
                }

            },
            delete: function (table, key, callback) {
                var storeObj = getObjectStore(table, "readwrite");
                if (storeObj.status != 0) {
                    callback && callback(getReturnObj(null, -1, storeObj.message));
                    return;
                }
                var store = storeObj.data;
                var req = store.delete(key);
                req.onerror = function (e) {
                    callback && callback(getReturnObj(null, -1, "delete failed"));
                }
                req.onsuccess = function (e) {
                    callback && callback(getReturnObj(null, 0, null));
                }
            },
            deleteAll: function (table, callback) {
                var storeObj = getObjectStore(table, "readwrite");
                if (storeObj.status != 0) {
                    callback && callback(getReturnObj(null, -1, storeObj.message));
                    return;
                }
                var store = storeObj.data;
                var req = store.clear();
                req.onerror = function (e) {
                    callback && callback(getReturnObj(null, -1, "delete all failed"));
                }
                req.onsuccess = function (e) {
                    callback && callback(getReturnObj(null, 0, null));
                }
            },
            update: function (table, key, data, callback) {
                this.delete(table, key, function (result) {
                    if (result.status != 0) {
                        callback && callback(result);
                        return;
                    }
                    $T.indexDB.add(table, key, data, function (result) {
                        callback && callback(result);
                    });
                });
            },
            readAll: function (table, callback) {
                var storeObj = getObjectStore(table, "readonly");
                if (storeObj.status != 0) {
                    callback && callback(getReturnObj(null, -1, storeObj.message));
                    return;
                }
                var store = storeObj.store;
                var cursor = store.openCursor();
                cursor.onsuccess = function (e) {
                    var res = e.target.result;
                    if (res) {
                        res.continue();
                    }
                }

            },
            getAllData: function (table, callback) {
                var storeObj = getObjectStore(table, "readonly");
                if (storeObj.status != 0) {
                    callback && callback(getReturnObj(null, -1, storeObj.message));
                    return;
                }
                var store = storeObj.data;
                var allRecords = store.getAll();
                allRecords.onsuccess = function () {
                    var result = allRecords.result;
                    var returnResult = [];
                    if (result) {
                        for (var i = 0; i < result.length; i++) {
                            returnResult.push(result[i].data)
                        }
                    }
                    callback && callback(getReturnObj(returnResult, 0, null));

                };
                allRecords.onerror = function (e) {
                    callback && callback(getReturnObj(null, -1, "get all data failed"));
                }
            },
            getData: function (table, key, callback) {
                var storeObj = getObjectStore(table, "readwrite");
                if (storeObj.status != 0) {
                    callback && callback(getReturnObj(null, -1, storeObj.message));
                    return;
                }
                var store = storeObj.data;
                var request = store.get(key);
                request.onerror = function (e) {
                    callback && callback(getReturnObj(null, -1, "get data failed"));
                };
                request.onsuccess = function (event) {
                    var data = null;
                    if (request.result) {
                        data = request.result.data;
                    }
                    callback && callback(getReturnObj(data, 0, null));
                };
            }
        },



    }
    if (!noGlobal) {
        window.TQR = window.$T = TQR;
    }
    return TQR;
});
