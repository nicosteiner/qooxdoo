/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Gabriel Munteanu (gabios)
     * Christopher Zuendorf (czuendorf)

************************************************************************ */

/**
 * The SelectBox
 *
 * an example, how to use the SelectBox:
 * *Example*
 *
 * <pre class='javascript'>
 *    var page1 = new qx.ui.mobile.page.Page();
 *    page1.addListener("initialize", function()
 *    {
 *      var sel = new qx.ui.mobile.form.SelectBox();
 *      page1.add(sel);
 *      var model = new qx.data.Array(["item1","item2"]);
 *      sel.setModel(model);
 *      model.push("item3");
 * 
 *      var but = new qx.ui.mobile.form.Button("setSelection");
 *      page1.add(but);
 *      but.addListener("tap", function(){
 *        sel.setSelection("item3");
 *      }, this);
 *
 *      var title = new qx.ui.mobile.form.Title("item2");
 *      title.bind("value",sel,"value");
 *      sel.bind("value",title,"value");
 *      page1.add(title);
 *   },this);
 *
 *   page1.show();
 *  </pre>
 */
qx.Class.define("qx.ui.mobile.form.SelectBox",
{
  extend : qx.ui.mobile.core.Widget,
  include : [
    qx.ui.mobile.form.MValue,
    qx.ui.form.MForm,
    qx.ui.mobile.form.MText,
    qx.ui.mobile.form.MState
  ],
  implement : [
    qx.ui.form.IForm,
    qx.ui.form.IModel
  ],


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */
  construct : function()
  {
    this.base(arguments);

    // This text node is for compatibility reasons, because Firefox can not
    // change appearance of select boxes.
    this._setAttribute("type","text");
    this.setReadOnly(true);

    // Selection dialog creation.
    this.__selectionDialog = this._createSelectionDialog();

    // When selectionDialogs changes selection, get chosen selectedIndex from it.
    this.__selectionDialog.addListener("changeSelection", this._onChangeSelection, this);
  },


  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */
  events :
  {
    /**
     * Fired when user selects an item.
     */
    changeSelection : "qx.event.type.Data"
  },


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {

    // overridden
    defaultCssClass :
    {
      refine : true,
      init : "selectbox"
    },

    // overridden
    activatable :
    {
      refine :true,
      init : true
    },


    /**
     * Defines if the selectBox has a clearButton, which resets the selection.
     */
    nullable :
    {
      init : false,
      check : "Boolean",
      apply : "_applyNullable"
    },


    /**
     * The model to use to render the list.
     */
    model :
    {
      check : "qx.data.Array",
      apply : "_applyModel",
      event : "changeModel",
      nullable : true,
      init : null
    }
  },

  members :
  {
    __selectedIndex : null,
    __selectionDialog : null,


    // overridden
    _getTagName : function()
    {
      // No select here, see BUG #6054
      return "input";
    },


    // overridden
    _createContainerElement : function()
    {
      var containerElement = this.base(arguments);

      var showSelectionDialog = qx.lang.Function.bind(this.__showSelectionDialog, this);
      qx.bom.Event.addNativeListener(containerElement, "tap", showSelectionDialog, false);
      qx.bom.Event.addNativeListener(containerElement, "click", showSelectionDialog, false);

      var preventDefault = qx.bom.Event.preventDefault;
      qx.bom.Event.addNativeListener(containerElement, "click", preventDefault, false);
      qx.bom.Event.addNativeListener(containerElement, "tap", preventDefault, false);

      return containerElement;
    },


    /**
     * Creates the menu dialog. Override this to customize the widget.
     *
     * @return {qx.ui.mobile.dialog.Menu} A dialog, containing a selection list.
     */
    _createSelectionDialog : function() {
      var menu =  new qx.ui.mobile.dialog.Menu();

      // Special appearance for select box menu items.
      menu.setSelectedItemClass("selectbox-selected");
      menu.setUnselectedItemClass("selectbox-unselected");

      // Hide selectionDialog on tap on blocker.
      menu.setHideOnBlockerClick(true);

      return menu;
    },


    /**
     * Returns the selected index of the element
     * @return {Number} the selected index value
     */
    getSelection : function() {
      return this.__selectedIndex;
    },


    /**
     * Sets the selected index of the element.
     * @param value {Number} the index of the selection
     */
    setSelection : function(value) {
      if(this.getModel() && this.getModel().length > value && value > -1) {
        this.__selectedIndex = value;

        if(value == null){
          this._setAttribute("value", null);
        } else {
          this._setAttribute("value", this.getModel().getItem(value));
        }
      }
    },


    /**
     * Sets the dialog title on the selection dialog.
     * @param title {String} the title to set on selection dialog.
     */
    setDialogTitle : function(title) {
      if(this.__selectionDialog) {
        this.__selectionDialog.setTitle(title);
      }
    },


    /**
     * Set the ClearButton label of the selection dialog.
     * @param value {String} the value to set on the ClearButton at selection dialog.
     */
    setClearButtonLabel : function(value) {
      this.__selectionDialog.setClearButtonLabel(value);
    },


    // property apply
    _applyNullable : function(isNullable) {
      // Delegate nullable property.
      if(this.__selectionDialog) {
        this.__selectionDialog.setNullable(isNullable);
      }
    },


    /**
     * Sets the selected text value of this select box.
     * @param value {String} the text value which should be selected.
     */
    _setValue : function(value) {
      if(value == null){
        this._setAttribute("value", null);
      } else {
        if(this.getModel()) {
          var indexOfValue = this.getModel().indexOf(value);
          if(indexOfValue > -1) {
            this.__selectedIndex = indexOfValue;
            this._setAttribute("value",value);
          }
        }
      }
    },


    /**
     * Get the text value of this
     * It is called by setValue method of qx.ui.mobile.form.MValue mixin.
     * @return {Number} the new selected index of the select box.
     */
    _getValue : function() {
      return this._getAttribute("value");
    },


    /**
     * Renders the selectbox. Override this if you would like to display the
     * values of the select box in a different way than the default.
     */
    _render : function() {
      if(this.getModel() && this.getModel().length > 0) {
        var selectedItem = null;

        if(this.__selectedIndex == null) {
          if(!this.isNullable()) {
            // Default selected index is 0.
            this.__selectedIndex = 0;
            selectedItem = this.getModel().getItem(this.__selectedIndex);
          }
        } else {
          selectedItem = this.getModel().getItem(this.__selectedIndex);
        }

        this._setAttribute("value", selectedItem);
      }

      this._domUpdated();
    },


    /**
     * Sets the model property to the new value
     * @param value {qx.data.Array}, the new model
     * @param old {qx.data.Array?}, the old model
     */
    _applyModel : function(value, old){
      value.addListener("change", this._render, this);
      if (old != null) {
        old.removeListener("change", this._render, this);
      }

      this._render();
    },


    /**
     * Refreshs selection dialogs model, and shows it.
     */
    __showSelectionDialog : function () {
      // Set index before items, because setItems() triggers rendering.
      this.__selectionDialog.setSelectedIndex(this.__selectedIndex);
      this.__selectionDialog.setItems(this.getModel());
      this.__selectionDialog.show();
    },


    /**
     * Gets the selectedIndex out of change selection event and renders view.
     * @param evt {qx.event.type.Data} data event.
     */
    _onChangeSelection : function (evt) {
      var evtIndex = evt.getData().index;
      var evtItem = evt.getData().item;
      this.__selectedIndex = evtIndex;
      this._render();

      // Bubbling event. For making it possible to listen on changeSelection event fired by SelectBox.
      this.fireDataEvent("changeSelection", {index: evtIndex, item: evtItem});
    }
  }
  ,

  /*
  *****************************************************************************
      DESTRUCTOR
  *****************************************************************************
  */
  destruct : function()
  {
    this._disposeObjects("__selectionDialog","__selectionDialogTitle");
  }
});
