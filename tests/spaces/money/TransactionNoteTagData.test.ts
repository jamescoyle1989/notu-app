import { NoteTag, Space, Tag } from "notu";
import { expect, test } from "vitest";
import { MoneySpaceSetup } from "../../../spaces/money/MoneySpaceSetup";
import { TransactionData } from "../../../spaces/money/TransactionNoteTagData";

const moneySpace = new Space('Money');
moneySpace.internalName = MoneySpaceSetup.internalName;
moneySpace.clean();

const transaction = new Tag(MoneySpaceSetup.transaction)
    .in(moneySpace).clean();


test('addAlternativeTransaction works properly', () => {
    const nt = new NoteTag(transaction);
    const data = new TransactionData(nt);
    data.description = 'Description 1';
    nt.clean();
    data.addAlternativeDescription('Description 2');

    expect(data.alternativeDescriptions).toHaveLength(1);
    expect(data.alternativeDescriptions[0]).toBe('Description 2');
    expect(nt.state).toBe('DIRTY');
});