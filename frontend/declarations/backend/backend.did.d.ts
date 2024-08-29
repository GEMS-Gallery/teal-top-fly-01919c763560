import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface _SERVICE {
  'addPerson' : ActorMethod<[], bigint>,
  'getBillSplit' : ActorMethod<
    [],
    [] | [{ 'total' : number, 'people' : Array<[bigint, number, number]> }]
  >,
  'removePerson' : ActorMethod<[bigint], boolean>,
  'setBillTotal' : ActorMethod<[number], undefined>,
  'updatePercentage' : ActorMethod<[bigint, number], boolean>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
