import { ObjModel } from './ObjModel.js';
describe('ObjModel', () => {
    it('inherits property types from behaviors, for TypeScript', () => {
        ~class extends ObjModel {
            test() {
                this.obj;
                this.mtl;
            }
        };
        // TODO enable TSX and test JSX markup.
    });
});
//# sourceMappingURL=ObjModel.test.js.map