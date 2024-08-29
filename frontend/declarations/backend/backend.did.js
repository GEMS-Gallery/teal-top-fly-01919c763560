export const idlFactory = ({ IDL }) => {
  return IDL.Service({
    'addPerson' : IDL.Func([], [IDL.Nat], []),
    'getBillSplit' : IDL.Func(
        [],
        [
          IDL.Opt(
            IDL.Record({
              'total' : IDL.Float64,
              'people' : IDL.Vec(IDL.Tuple(IDL.Nat, IDL.Float64, IDL.Float64)),
            })
          ),
        ],
        ['query'],
      ),
    'removePerson' : IDL.Func([IDL.Nat], [IDL.Bool], []),
    'setBillTotal' : IDL.Func([IDL.Float64], [], []),
    'updatePercentage' : IDL.Func([IDL.Nat, IDL.Float64], [IDL.Bool], []),
  });
};
export const init = ({ IDL }) => { return []; };
