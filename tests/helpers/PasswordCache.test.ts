import dayjs from "dayjs";
import { NoteTag, Space, Tag } from "notu";
import { expect, test } from "vitest";
import { PasswordCache } from "../../helpers/PasswordCache";
import { PasswordProtectionData } from "../../spaces/system/PasswordProtectionNoteTagData";
import defs from "../../spaces/system/SystemSpaceDefs";
import { FakeDateProvider } from "../testhelpers/FakeDateProvider";


function createFakePasswordProtectionTag() {
    const systemSpace = new Space('System');
    systemSpace.internalName = defs.internalName;
    const passwordProtectionTag = new Tag(defs.passwordProtection);
    passwordProtectionTag.id = 1;
    passwordProtectionTag.space = systemSpace;
    passwordProtectionTag.clean();
    return passwordProtectionTag;
}


test('add successfully stores password', () => {
    // Arrange
    const cache = new PasswordCache(new FakeDateProvider());

    const noteTagData = new PasswordProtectionData(new NoteTag(createFakePasswordProtectionTag()));
    noteTagData.cacheDurationMs = 10000;

    // Act
    cache.add('abc123', 45, noteTagData, 500);

    // Assert
    expect(cache.get(45, 500)).toBe('abc123');
});

test('add with null noteId stores password for all notes', () => {
    // Arrange
    const cache = new PasswordCache(new FakeDateProvider());

    const noteTagData = new PasswordProtectionData(new NoteTag(createFakePasswordProtectionTag()));
    noteTagData.cacheDurationMs = 10000;

    // Act
    cache.add('abc123', 45, noteTagData, null);

    // Assert
    expect(cache.get(45, 500)).toBe('abc123');
    expect(cache.get(45, 501)).toBe('abc123');
    expect(cache.get(45, 502)).toBe('abc123');
});


test('added passwords expire', () => {
    // Arrange
    const fakeDateProvider = new FakeDateProvider();
    const cache = new PasswordCache(fakeDateProvider);

    const noteTagData = new PasswordProtectionData(new NoteTag(createFakePasswordProtectionTag()));
    noteTagData.cacheDurationMs = 10000;

    // Act
    cache.add('abc123', 45, noteTagData, 500);
    fakeDateProvider.nowReturnValue = dayjs(fakeDateProvider.nowReturnValue).add(11, 'seconds').toDate();

    // Assert
    expect(cache.get(45, 500)).toBeNull();
});


test('forget successfully removes password', () => {
    // Arrange
    const cache = new PasswordCache(new FakeDateProvider());
    
    const noteTagData = new PasswordProtectionData(new NoteTag(createFakePasswordProtectionTag()));
    noteTagData.cacheDurationMs = 10000;

    // Act
    cache.add('abc123', 45, noteTagData, 500);
    cache.forget(45, 500);

    // Assert
    expect(cache.get(45, 500)).toBeNull();
});

test('forget with null noteId successfully removes all passwords', () => {
    // Arrange
    const cache = new PasswordCache(new FakeDateProvider());

    const noteTagData = new PasswordProtectionData(new NoteTag(createFakePasswordProtectionTag()));
    noteTagData.cacheDurationMs = 10000;

    cache.add('abc123', 45, noteTagData, 500);
    cache.add('abc124', 45, noteTagData, null);

    // Act
    cache.forget(45, null);

    // Assert
    expect(cache.get(45, 500)).toBeNull();
});