import Bool "mo:base/Bool";
import Int "mo:base/Int";

import Float "mo:base/Float";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";

actor {
  stable var billTotal : Float = 0.0;
  stable var people : [(Nat, Float)] = [];
  var nextId : Nat = 0;

  public func setBillTotal(total : Float) : async () {
    billTotal := total;
  };

  public func addPerson() : async Nat {
    let id = nextId;
    nextId += 1;
    people := Array.append(people, [(id, 0.0)]);
    await redistributePercentages();
    id
  };

  public func removePerson(id : Nat) : async Bool {
    let (newPeople, removed) = Array.foldLeft<(Nat, Float), ([(Nat, Float)], Bool)>(
      people,
      ([], false),
      func ((acc, removed), person) {
        if (person.0 == id) {
          (acc, true)
        } else {
          (Array.append(acc, [person]), removed)
        }
      }
    );
    people := newPeople;
    if (removed) {
      await redistributePercentages();
    };
    removed
  };

  public func updatePercentage(id : Nat, percentage : Float) : async Bool {
    let updatedPeople = Array.map<(Nat, Float), (Nat, Float)>(
      people,
      func (person) {
        if (person.0 == id) {
          (person.0, percentage)
        } else {
          person
        }
      }
    );
    people := updatedPeople;
    await redistributePercentages();
    true
  };

  private func redistributePercentages() : async () {
    let totalPercentage = Array.foldLeft<(Nat, Float), Float>(
      people,
      0.0,
      func (acc, person) { acc + person.1 }
    );

    if (totalPercentage != 100.0 and Array.size(people) > 0) {
      let equalPercentage = 100.0 / Float.fromInt(Array.size(people));
      people := Array.map<(Nat, Float), (Nat, Float)>(
        people,
        func (person) { (person.0, equalPercentage) }
      );
    };
  };

  public query func getBillSplit() : async ?{
    total : Float;
    people : [(Nat, Float, Float)];
  } {
    if (billTotal == 0.0 or Array.size(people) == 0) {
      return null;
    };

    let peopleWithAmounts = Array.map<(Nat, Float), (Nat, Float, Float)>(
      people,
      func (person) {
        let amount = (person.1 / 100.0) * billTotal;
        (person.0, person.1, amount)
      }
    );

    ?{
      total = billTotal;
      people = peopleWithAmounts;
    }
  };
}
