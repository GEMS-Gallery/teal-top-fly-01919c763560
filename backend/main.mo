import Bool "mo:base/Bool";

import Float "mo:base/Float";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Text "mo:base/Text";
import Option "mo:base/Option";

actor {
  // Stable variables
  stable var billTotal : Float = 0.0;
  stable var people : [(Nat, Text, Float)] = [];

  // Mutable variable
  var nextId : Nat = 0;

  // Add a person to the bill split
  public func addPerson(name : Text) : async Nat {
    let id = nextId;
    nextId += 1;
    people := Array.append(people, [(id, name, 0.0)]);
    id
  };

  // Remove a person from the bill split
  public func removePerson(id : Nat) : async Bool {
    let (newPeople, removed) = Array.foldLeft<(Nat, Text, Float), ([(Nat, Text, Float)], Bool)>(
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
    removed
  };

  // Update a person's percentage
  public func updatePercentage(id : Nat, percentage : Float) : async Bool {
    let updatedPeople = Array.map<(Nat, Text, Float), (Nat, Text, Float)>(
      people,
      func (person) {
        if (person.0 == id) {
          (person.0, person.1, percentage)
        } else {
          person
        }
      }
    );
    people := updatedPeople;
    true
  };

  // Set the total bill amount
  public func setBillTotal(total : Float) : async () {
    billTotal := total;
  };

  // Get the current bill split information
  public query func getBillSplit() : async ?{
    total : Float;
    people : [(Nat, Text, Float, Float)];
    remaining : Float;
  } {
    if (billTotal == 0.0 or Array.size(people) == 0) {
      return null;
    };

    let totalPercentage = Array.foldLeft<(Nat, Text, Float), Float>(
      people,
      0.0,
      func (acc, person) { acc + person.2 }
    );

    let peopleWithAmounts = Array.map<(Nat, Text, Float), (Nat, Text, Float, Float)>(
      people,
      func (person) {
        let amount = (person.2 / 100.0) * billTotal;
        (person.0, person.1, person.2, amount)
      }
    );

    let remaining = 100.0 - totalPercentage;

    ?{
      total = billTotal;
      people = peopleWithAmounts;
      remaining = remaining;
    }
  };
}
