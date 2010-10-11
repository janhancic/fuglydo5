var todo5= {};

todo5.setObject = function ( key, value ) {
	localStorage.setItem ( key, JSON.stringify ( value ) );
};

todo5.getObject = function ( key ){
	var item = localStorage.getItem ( key );

	if ( item === undefined || item === null ){
		return null;
	}

	return JSON.parse ( item );
};

todo5.undoDoneItem = {
	id: null,
	text: null,
	newId: null
};

todo5.undoDeleteItem = {
	id: null,
	text: null,
	type: null
};

todo5.$txtNew = $( '#txtNew' );
todo5.$items = $( 'ul' );
todo5.$msg = $( '#Msg' );
todo5.$export = $( '#Export' );
todo5.$import = $( '#Import' );
todo5.$btnImport = $( '#btnImport' );
todo5.$btnCancel = $( '#btnCancel' );
todo5.$showToDo = $( '#Show_todo' );
todo5.$showDone = $( '#Show_done' );
todo5.msgTimer = null;

todo5.getItems = function ( type ) {
	var items = todo5.getObject ( 'todo5:' + type );

	if( items === null ) {
		items = [];
	}

	return items;
};

todo5.saveItem = function ( type, text ) {
	var items = todo5.getItems ( type );
	var newId = items.length;

	items[newId] = text;

	todo5.setObject ( 'todo5:' + type, items );

	return newId;
};

todo5.deleteItem = function ( type, itemId ) {
	var items = todo5.getItems ( type );

	delete items[itemId];

	todo5.setObject ( 'todo5:' + type, items );
};

todo5.removeAllItems = function () {
	localStorage.removeItem ( 'todo5:todo' );
	localStorage.removeItem ( 'todo5:done' );
};

todo5.undoDone = function () {
	var items = todo5.getItems ( 'todo' );
	items[todo5.undoDoneItem.id] = todo5.undoDoneItem.text;

	todo5.setObject ( 'todo5:todo', items );
	todo5.deleteItem ( 'done', todo5.undoDoneItem.newId );
	todo5.renderItems ( 'todo' );
};

todo5.undoDelete = function () {
	var items = todo5.getItems ( todo5.undoDeleteItem.type );
	items[todo5.undoDeleteItem.id] = todo5.undoDeleteItem.text;

	todo5.setObject ( 'todo5:' + todo5.undoDeleteItem.type, items );
	todo5.renderItems ( todo5.undoDeleteItem.type );
};

todo5.sanitizeItems = function ( type ) {
	var items = todo5.getItems ( type );
	var newItems = [];
	var index = 0;

	for ( var itemId in items ) {
		if ( items[itemId] === null ) {
			continue;
		}

		newItems[index] = items[itemId];
		index = index + 1;
	}

	todo5.setObject ( 'todo5:' + type, newItems );
};

todo5.renderItems = function ( type ) {
	todo5.$items.empty ();

	var items = todo5.getItems ( type );
	var numOfAdded = 0;

	for ( var itemId in items ) {
		if ( items[itemId] === null ) {
			continue;
		}

		var $newItem = $( '<li>' ).attr ( 'id', 'i_' + itemId ).text ( items[itemId] );
		if ( type === 'todo' ) {
			$newItem.append ( $( '<a>' ).attr ( 'href', '#' ).addClass ( 'Done' ) );
		}

		$newItem.append ( $( '<a>' ).attr ( 'href', '#' ).attr ( 'rel', type ).addClass ( 'Delete' ).text ( 'delete') );
		todo5.$items.append ( $newItem );
		numOfAdded = numOfAdded + 1;
	}

	if ( numOfAdded === 0 ) {
		var noItemsMsg = '';

		if ( type === 'todo' ) {
			noItemsMsg = 'you have no TODOs ... relax';
		} else {
			noItemsMsg = 'you haven\'t done anything yet ... tsk tsk';
		}

		todo5.$items.append ( '<li id="NoItems">' + noItemsMsg + '</li>' );
	}

	if ( type === 'todo' ) {
		todo5.$showToDo.parents ( 'li' ).addClass ( 'Selected' );
		todo5.$showDone.parents ( 'li' ).removeClass ( 'Selected' );
	} else {
		todo5.$showDone.parents ( 'li' ).addClass ( 'Selected' );
		todo5.$showToDo.parents ( 'li' ).removeClass ( 'Selected' );
	}
};

todo5.sanitizeItems ( 'todo' );
todo5.sanitizeItems ( 'done' );

todo5.renderItems ( 'todo' );

$( 'form' ).submit ( function () {
	var newText = $.trim ( todo5.$txtNew.val () );

	if ( newText !== '' ) {
		todo5.saveItem ( 'todo', newText );
		todo5.renderItems ( 'todo' );
		todo5.$txtNew.val ( '' );
	}

	return false;
} );

$( 'ul > li' ).live ( 'mouseenter ', function () {
	$( this ).find ( 'a' ).css ( 'display', 'inline-block' );
} );

$( 'ul > li' ).live ( 'mouseleave', function () {
	$( this ).find ( 'a' ).css ( 'display', 'none' );
} );

$( 'ul > li > a.Done' ).live ( 'click', function () {
	var $this = $( this );
	var itemId = $this.parents ( 'li' ).attr ( 'id' ).split ( '_' )[1];
	var doneId = todo5.saveItem ( 'done', todo5.getItems ( 'todo' )[itemId] );

	todo5.undoDoneItem.id = itemId;
	todo5.undoDoneItem.text = todo5.getItems ( 'todo' )[itemId];
	todo5.undoDoneItem.newId = doneId;
	todo5.deleteItem ( 'todo', itemId );
	todo5.renderItems ( 'todo' );
	todo5.$msg.html ( '' );

	clearTimeout ( todo5.msgTimer );
	todo5.msgTimer = null;

	todo5.$msg.text ( 'Marked as completed! ' );
	var $undoLink = $( '<a>' ).attr ( 'href', '#' ).text ( 'Undo?' );
	$undoLink.click ( function () {
		todo5.undoDone ();
		todo5.$msg.html ( '' );

		return false;
	} );

	todo5.$msg.append ( $undoLink );

	todo5.msgTimer = setTimeout (
		function () {
			todo5.$msg.html ( '' );
		},
		5000
	);

	return false;
} );

$( 'ul > li > a.Delete' ).live ( 'click', function () {
	var $this = $( this );
	var itemId = $this.parents ( 'li' ).attr ( 'id' ).split ( '_' )[1];
	var type = $this.attr ( 'rel' );

	todo5.undoDeleteItem.id = itemId;
	todo5.undoDeleteItem.text = todo5.getItems ( type )[itemId];
	todo5.undoDeleteItem.type = type;
	todo5.deleteItem ( type, itemId );
	todo5.renderItems ( type );
	todo5.$msg.html ( '' );

	clearTimeout ( todo5.msgTimer );
	todo5.msgTimer = null;

	todo5.$msg.text ( 'Deleted! ' );
	var $undoLink = $( '<a>' ).attr ( 'href', '#' ).text ( 'Undo?' );
	$undoLink.click ( function () {
		todo5.undoDelete ();
		todo5.$msg.html ( '' );

		return false;
	} );

	todo5.$msg.append ( $undoLink );
	todo5.msgTimer = setTimeout (
		function () {
			todo5.$msg.html ( '' );
		},
		5000
	);

	return false;
} );

todo5.$showToDo.click ( function () {
	todo5.renderItems ( 'todo' );

	return false;
} );

todo5.$showDone.click ( function () {
	todo5.renderItems ( 'done' );

	return false;
} );

$( '#ExportLink' ).click ( function () {
	var exportStr = {
		todo: localStorage.getItem ( 'todo5:todo' ),
		done: localStorage.getItem ( 'todo5:done' )
	}

	todo5.$export.find ( 'textarea' ).val ( JSON.stringify ( exportStr ) );
	todo5.$export.show ();
	todo5.$export.find ( 'a' ).click ( function () {
		todo5.$export.hide ();

		return false;
	} );

	return false;
} );

$( '#ImportLink' ).click ( function () {
	todo5.$import.show ();

	return false;
} );

todo5.$btnImport.click ( function () {
	var importVal = $.trim ( todo5.$import.find ( 'textarea' ).val () );

	if ( importVal !== '' ) {
		try {
			var importObj = JSON.parse ( importVal );
			todo5.setObject ( 'todo5:todo', JSON.parse ( importObj.todo ) );
			todo5.setObject ( 'todo5:done', JSON.parse ( importObj.done ) );
			document.location = document.location;
		} catch ( err ) {
			alert ( 'Data is not valid!' );
		}
	}
} );

todo5.$btnCancel.click ( function () {
	todo5.$import.hide ();
} );

$( '#RemoveAll' ).click ( function () {
	if ( confirm ( 'Are you sure you want to remove all items? This can\'t be undone!' ) === true ) {
		todo5.removeAllItems ();
		document.location = document.location;
	}

	return false;
} );

var defaultText = 'Add TO-DO';
todo5.$txtNew
	.val ( defaultText )
	.addClass ( 'NotActive' )
	.blur ( function () {
		if ( $.trim ( todo5.$txtNew.val () ) === '' ) {
			todo5.$txtNew.val ( defaultText ).addClass ( 'NotActive' );
		}
	} )
	.focus ( function () {
		if ( todo5.$txtNew.val () === defaultText ) {
			todo5.$txtNew.removeClass ( 'NotActive' ).val ( '' );
		}
	}
);