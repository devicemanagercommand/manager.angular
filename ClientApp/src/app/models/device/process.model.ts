import { TerminalLine } from "src/app/services/device/process.service";

export class ProcessModel {
  constructor() {
    this.terminalLines = new Array<TerminalLine>();
  }
  public terminalLines: Array<TerminalLine>;
}
