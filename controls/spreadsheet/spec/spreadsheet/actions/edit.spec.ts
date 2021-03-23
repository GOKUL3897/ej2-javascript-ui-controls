import { Spreadsheet, SpreadsheetModel } from '../../../src/spreadsheet/index';
import { SpreadsheetHelper } from "../util/spreadsheethelper.spec";
import { defaultData } from '../util/datasource.spec';
import { CellModel } from '../../../src';

/**
 *  Keyboard shortcuts spec
 */

describe('Spreadsheet edit module ->', () => {
    let helper: SpreadsheetHelper = new SpreadsheetHelper('spreadsheet');
    let model: SpreadsheetModel;
    describe('Checking updated edited value ->', () => {
        beforeAll((done: Function) => {
            model = {
                sheets: [{
                    ranges: [{ dataSource: defaultData }],
                    rows: [{
                        index: 1,
                        cells: [
                            { index: 9, formula: '=D2' },
                            { index: 11, formula: '=J2' },
                            { index: 13, formula: '=L2' },
                            { index: 15, formula: '=N2' },
                        ]
                    }]
                }]
            };
            helper.initializeSpreadsheet(model, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('Check multiple cell dependency', (done: Function) => {
            setTimeout(() => {
                helper.invoke('getData', ['Sheet1!A1:Q11']).then((values: Map<string, CellModel>) => {
                    expect(values.get('D2').value.toString()).toEqual('10');
                    expect(values.get('J2').value.toString()).toEqual('10');
                    expect(values.get('L2').value.toString()).toEqual('10');
                    expect(values.get('N2').value.toString()).toEqual('10');
                    done();
                });
            }, 20);
        });
    });

    describe('Rtl ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({ enableRtl: true }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('', (done: Function) => {
            let td: HTMLElement = helper.invoke('getCell', [3, 5]);
            let coords: ClientRect = td.getBoundingClientRect();
            helper.triggerMouseAction('dblclick', { x: coords.right, y: coords.top }, null, td);
            let ele: HTMLElement = helper.getElementFromSpreadsheet('.e-spreadsheet-edit');
            // expect(ele.style.top).toBe('61px');
            // expect(ele.style.right).toBe('321px');
            // expect(ele.style.height).toBe('17px');
            done();
        });
    });

    describe('CR-Issues ->', () => {
        beforeAll((done: Function) => {
            model = {
                sheets: [{ ranges: [{ dataSource: defaultData }] }], height: 1000,
                created: (): void => {
                    helper.getInstance().cellFormat({ fontWeight: 'bold', textAlign: 'center' }, 'A1:H1');
                }
            };
            helper.initializeSpreadsheet(model, done);
        });

        afterAll(() => {
            helper.invoke('destroy');
        });

        describe('I309407 ->', () => {
            it('curser is moving to the 4th cell when click on the second cell after entering value in first cell', (done: Function) => {
                const spreadsheet: any = helper.getInstance();
                expect(spreadsheet.sheets[0].selectedRange).toEqual('A1:A1');
                spreadsheet.editModule.startEdit();
                spreadsheet.editModule.editCellData.value = 'Customer';
                helper.triggerKeyNativeEvent(13);
                expect(spreadsheet.sheets[0].selectedRange).toEqual('A2:A2');
                done();
            });
        });
    });
});