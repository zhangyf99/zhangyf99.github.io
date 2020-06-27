//"use strict";
var $ = function (sel) {
    return document.querySelector(sel);
};
var $All = function (sel) {
    return document.querySelectorAll(sel);
};

//var lastFilter='#All';

window.onload = function () {
    model.init(function () {
        var data = model.data;
        /*$('#newTodo').addEventListener('blur',function(){
            //data.msg=this.value;
            //console.log('end');
            data.msg=this.value;
            //data.completed=false;
        });*/
        var completeMus = $('#completeMus');
        var deleteMus = $('#deleteMus');
        var addMus = $('#addMus');
        new Hammer($('#addButton')).on('tap', addTodo);
        //new Hammer($('#searchButton')).on('tap', search);
        new Hammer($('#finishAll')).on('tap', finishAll);
        new Hammer($('#unfinishAll')).on('tap', unfinishAll);
        new Hammer($('#deleteFinished')).on('tap', deleteFinished);
        var filters = $All('#filter li');
        for (var i = 0; i < filters.length; i++) {
            let filterB = filters[i];
            var hammerFilter = new Hammer(filters[i]);
            hammerFilter.on('tap', function () {
                filter(filterB)
            });
            //new Hammer(filters[i]).on('tap',filter);
            //filters[i].addEventListener('click',filter);
        }
    }
    )
    update();
}

//新增todo
function addTodo() {
    var data = model.data;
    //console.log('add');
    data.msg = $('#newTodo').value;
    data.date=$('#newTodoDate').value;
    if (data.msg == '') {
        alert("the input todo is empty!");
        return;
    }
    data.items.push(
        {
            msg: data.msg,
            date:data.date,
            completed: false
        }
    )
    $('#newTodo').value = '';
    $('#newTodoDate').value = '';
    update();
    addMus.play();
}

/*function search(){
    $('#search').classList.add('focused');
    var keyword=$('#searchContent').value;
    if(keyword==''){
        alert("the input keyword is empty!");
        return;
    }
    
}*/

//全部完成
function finishAll() {
    var items = model.data.items;
    for (var i = 0; i < items.length; i++) {
        items[i].completed = true;
    }
    update();
    completeMus.play();
}

//全部取消
function unfinishAll() {
    var items = model.data.items;
    for (var i = 0; i < items.length; i++) {
        items[i].completed = false;
    }
    update();
}

//删除已完成
function deleteFinished() {
    var items = model.data.items;
    for (var i = 0; i < items.length; i++) {
        if (items[i].completed) {
            //model.data.items.splice(i, 1);
            items.splice(i, 1);
            i--;
        }
    }
    update();
    deleteMus.play();
}

//过滤
function filter(filterB) {
    //console.log(this.innerHTML);
    filterB.classList.add('selected');
    model.data.filter = filterB.innerHTML;
    var filters = $All('#filter li');
    for (var i = 0; i < filters.length; i++) {
        if (filters[i] != filterB && filters[i].classList.contains('selected')) {
            filters[i].classList.remove('selected');
        }
    }
    //$(lastFilter).classList.remove('selected');
    //lastFilter='#'+this.innerHTML;
    update();
}

function update() {
    model.flush();
    var data = model.data;
    var items = data.items;
    var list = $('#list ul');
    list.innerHTML = '';
    //$('#newTodo').value = '';
    var checkedSvg = '<svg class="icon" aria-hidden="true">' + '<use xlink:href="#icon-choosehandle"></use>' + '</svg>';
    var uncheckSvg = '<svg class="icon" aria-hidden="true">' + '<use xlink:href="#icon-weigouxuan"></use>' + '</svg>';
    //var checkSvg=uncheckSvg;
    for (var i = 0; i < items.length; i++) {
        if (data.filter == "All" || (data.filter == "Completed" && data.items[i].completed) || (data.filter == "Active" && !items[i].completed)) {
            //点击事件的闭包问题，利用let作用域解决
            let index = i;
            var item = document.createElement('li');
            item.id = 'item' + i;
            if (items[i].completed) {
                item.classList.add('completed');
                checkSvg = checkedSvg;
            }
            else {
                checkSvg = uncheckSvg;
            }
            /*item.innerHTML='<div class="view">'+'<button class="itemCheck">'+checkSvg+'</button>'+'<div class="todoItem">'+items[i].msg+'</div>'+'<button class="deleteSin">'+' <svg class="icon" aria-hidden="true">'+
            '<use xlink:href="#icon-shanchu"></use>'+'</svg>'+'</button>'+'</div>';*/
            var timeTag='';
            if(items[i].date)
            {
                timeTag='<time>'+'</time>';
            }
            item.innerHTML = '<div class="view target topIn">' + '<button class="itemCheck">' + checkSvg + '</button>' + '<input type="text" class="todoItem" disabled>' + timeTag +'<button class="deleteSin">' + ' <svg class="icon" aria-hidden="true">' +
                '<use xlink:href="#icon-shanchu"></use>' + '</svg>' + '</button>' + '</div>';
            item.querySelector('.view .todoItem').value = items[i].msg;
            if(items[i].date)
            {
                //item.querySelector('.view time').datetime = items[i].date;
                item.querySelector('.view time').innerHTML = items[i].date;
            }
            //绑定编辑
            let tempItem = item;
            let inputItem = item.querySelector('.view .todoItem');
            new Hammer(inputItem).on('doubletap', function () {
                function edit(inputItem) {
                    //未完成状态才能编辑  
                    if (!items[index].completed) {
                        inputItem.removeAttribute("disabled");
                        tempItem.classList.add('editing');
                        var todoEdit = tempItem.querySelector('.view');
                        var editItem = todoEdit.querySelector('.todoItem');
                        //editItem.contenteditable="true";
                        //editItem.autofocus="true";
                        editItem.addEventListener('blur', function () {
                            items[index].msg = inputItem.value;
                            update();
                            tempItem.classList.remove('editing');
                        })
                    }
                }
                edit(inputItem);

            })

            //绑定状态更改
            //var itemCheck=item.querySelector('.view').querySelector('.itemCheck');
            var itemCheck = item.querySelector('.view .itemCheck');
            //itemCheck.checked=items[i].completed;
            new Hammer(itemCheck).on('tap', function () {
                items[index].completed = !items[index].completed;
                update();
                if (items[index].completed) {
                    completeMus.play();
                }
            }, false);

            //绑定右滑完成
            var hammerTemp = new Hammer(tempItem);
            /*hammerTemp.get('pan').set({
                direction: Hammer.DIRECTION_RIGHT
            });*/
            hammerTemp.on('swiperight', function () {
                if (!items[index].completed) {
                    items[index].completed = true;
                    update();
                    completeMus.play();
                }
            }, false);

            //绑定删除单个
            var deleteButton = item.querySelector('.view .deleteSin');
            new Hammer(deleteButton).on('tap', function () {
                //items.splice(i, 1);
                items.splice(index, 1);
                i--;
                update();
                deleteMus.play();
            }, false)

            //绑定左滑删除
            var hammerTemp2 = new Hammer(tempItem);
            /*hammerTemp2.get('pan').set({
                direction: Hammer.DIRECTION_LEFT
            });*/
            hammerTemp2.on('swipeleft', function () {
                items.splice(index, 1);
                i--;
                update();
                deleteMus.play();
            }, false);

            list.insertBefore(item, list.firstChild);

        }
    }

}



