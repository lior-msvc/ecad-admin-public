import { Injectable } from '@angular/core';

// jquery support
declare var $: any;

@Injectable({
  providedIn: 'root'
})
export class ModalDialogsService {
  // modal dialog settings
  modalType: string = "info"; // info/error/confirm
  modalMessage: string = "";
  modalTitle: string = "";

  // ok callback
  onOkCallback: () => void = null;
  
  // default constructor
  constructor() {

  }

  // close dialog
  closeModal(){
    // check if we need to call callback
    if (this.onOkCallback != null) this.onOkCallback();

    // close modal window
    $("#alert-modal").modal('hide');
  }

  // show info dialog message
  showInfo(message: string, title = 'Information') {
    this.modalType = "info";
    this.modalTitle = title;
    this.modalMessage = message;

    // show modal window
    $("#alert-modal").modal('show');
  }

  // show error dialog message
  showError(message: string, title = 'Error') {
    this.modalType = "error";
    this.modalTitle = title;
    this.modalMessage = message;

    // show modal window
    $("#alert-modal").modal('show');
  }

  // show confirm dialog message
  showConfirm(message: string, title = 'Confirm', onOk: () => void = null) {
    this.modalType = "confirm";
    this.modalTitle = title;
    this.modalMessage = message;
    this.onOkCallback = onOk;

    // show modal window
    $("#alert-modal").modal('show');
  }

  // return icon name
  getIconName(){
    if (this.modalType == 'confirm') return "help";
    return this.modalType;
  }
}
