"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("jest");
const Sinon = require("sinon");
const NajsBinding = require("najs-binding");
const EloquentDriverProvider_1 = require("./../../lib/drivers/EloquentDriverProvider");
class FakeDriver {
}
FakeDriver.className = 'FakeDriver';
describe('EloquentDriverProvider', function () {
    describe('.register()', function () {
        it('registers class to ClassRegistry by using najs-binding', function () {
            const registerSpy = Sinon.spy(NajsBinding, 'register');
            EloquentDriverProvider_1.EloquentDriverProvider.register(FakeDriver, 'fake');
            expect(registerSpy.calledWith(FakeDriver)).toBe(true);
            expect(NajsBinding.ClassRegistry.has(FakeDriver.className)).toBe(true);
            expect(EloquentDriverProvider_1.EloquentDriverProvider['drivers']['fake']).toEqual({
                driverClassName: 'FakeDriver',
                isDefault: false
            });
            EloquentDriverProvider_1.EloquentDriverProvider.register(FakeDriver, 'fake', true);
            expect(EloquentDriverProvider_1.EloquentDriverProvider['drivers']['fake']).toEqual({
                driverClassName: 'FakeDriver',
                isDefault: true
            });
            registerSpy.restore();
        });
    });
    describe('protected .findDefaultDriver()', function () {
        it('returns a empty string if there is no drivers registered', function () {
            EloquentDriverProvider_1.EloquentDriverProvider['drivers'] = {};
            expect(EloquentDriverProvider_1.EloquentDriverProvider['findDefaultDriver']()).toEqual('');
        });
        it('returns a the first driver if there is no item with isDefault = true', function () {
            EloquentDriverProvider_1.EloquentDriverProvider['drivers'] = {
                'test-1': {
                    driverClassName: 'Test1',
                    isDefault: false
                },
                'test-2': {
                    driverClassName: 'Test2',
                    isDefault: false
                }
            };
            expect(EloquentDriverProvider_1.EloquentDriverProvider['findDefaultDriver']()).toEqual('Test1');
        });
        it('returns a driver with isDefault = true', function () {
            EloquentDriverProvider_1.EloquentDriverProvider['drivers'] = {
                'test-1': {
                    driverClassName: 'Test1',
                    isDefault: false
                },
                fake: {
                    driverClassName: 'FakeDriver',
                    isDefault: true
                },
                'test-2': {
                    driverClassName: 'Test2',
                    isDefault: false
                }
            };
            expect(EloquentDriverProvider_1.EloquentDriverProvider['findDefaultDriver']()).toEqual('FakeDriver');
        });
    });
    describe('protected .createDriver()', function () {
        it('calls "najs-binding".make() to create an instance of driver, model is passed in param', function () {
            const model = {};
            const makeStub = Sinon.stub(NajsBinding, 'make');
            makeStub.callsFake(() => { });
            EloquentDriverProvider_1.EloquentDriverProvider['createDriver'](model, 'DriverClass');
            expect(makeStub.calledWith('DriverClass', [model]));
            makeStub.restore();
        });
    });
    describe('.findDriverClassName()', function () {
        it('returns .findDefaultDriver() if there is no binding of model', function () {
            const findDefaultDriverSpy = Sinon.spy(EloquentDriverProvider_1.EloquentDriverProvider, 'findDefaultDriver');
            EloquentDriverProvider_1.EloquentDriverProvider.findDriverClassName('not-bind-yet');
            expect(EloquentDriverProvider_1.EloquentDriverProvider.findDriverClassName('not-bind-yet')).toEqual('FakeDriver');
            expect(findDefaultDriverSpy.called).toBe(true);
            findDefaultDriverSpy.restore();
        });
        it('returns .findDefaultDriver() if driver of model is not exists', function () {
            const findDefaultDriverSpy = Sinon.spy(EloquentDriverProvider_1.EloquentDriverProvider, 'findDefaultDriver');
            EloquentDriverProvider_1.EloquentDriverProvider.bind('bound-but-not-found', 'not-found');
            EloquentDriverProvider_1.EloquentDriverProvider.findDriverClassName('bound-but-not-found');
            expect(findDefaultDriverSpy.called).toBe(true);
            findDefaultDriverSpy.restore();
        });
        it('returns driverClassName if has binding and driver exists', function () {
            const findDefaultDriverSpy = Sinon.spy(EloquentDriverProvider_1.EloquentDriverProvider, 'findDefaultDriver');
            EloquentDriverProvider_1.EloquentDriverProvider.bind('model', 'fake');
            expect(EloquentDriverProvider_1.EloquentDriverProvider.findDriverClassName('model')).toEqual('FakeDriver');
            expect(findDefaultDriverSpy.called).toBe(false);
            findDefaultDriverSpy.restore();
        });
    });
    describe('.bind()', function () {
        it('simply assigns driver and model to private binding variable', function () {
            EloquentDriverProvider_1.EloquentDriverProvider['binding'] = {};
            expect(EloquentDriverProvider_1.EloquentDriverProvider['binding']).toEqual({});
            EloquentDriverProvider_1.EloquentDriverProvider.bind('model', 'driver');
            expect(EloquentDriverProvider_1.EloquentDriverProvider['binding']).toEqual({ model: 'driver' });
            EloquentDriverProvider_1.EloquentDriverProvider.bind('model', 'driver-override');
            expect(EloquentDriverProvider_1.EloquentDriverProvider['binding']).toEqual({ model: 'driver-override' });
        });
    });
    describe('.create()', function () {
        it('creates a driver instance with class name provided by .findDriverClassName()', function () {
            const createDriverSpy = Sinon.spy(EloquentDriverProvider_1.EloquentDriverProvider, 'createDriver');
            const findDriverClassNameSpy = Sinon.spy(EloquentDriverProvider_1.EloquentDriverProvider, 'findDriverClassName');
            const model = {
                getClassName() {
                    return 'test';
                }
            };
            const instance = EloquentDriverProvider_1.EloquentDriverProvider.create(model);
            expect(findDriverClassNameSpy.calledWith(model)).toBe(true);
            expect(createDriverSpy.calledWith(model, 'FakeDriver')).toBe(true);
            expect(instance).toBeInstanceOf(FakeDriver);
            findDriverClassNameSpy.restore();
            createDriverSpy.restore();
        });
    });
});