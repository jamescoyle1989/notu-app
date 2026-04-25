import { useManualRefresh } from "@/helpers/Hooks";
import { NotuButton, NotuText, NotuView } from "@/helpers/NotuStyles";
import { CalendarSpaceSetup } from "@/spaces/calendar/CalendarSpaceSetup";
import { CommonSpaceSetup } from "@/spaces/common/CommonSpaceSetup";
import { ContentSpaceSetup } from "@/spaces/content/ContentSpaceSetup";
import { FitnessSpaceSetup } from "@/spaces/fitness/FitnessSpaceSetup";
import { FoodSpaceSetup } from "@/spaces/food/FoodSpaceSetup";
import { MoneySpaceSetup } from "@/spaces/money/MoneySpaceSetup";
import { PeopleSpaceSetup } from "@/spaces/people/PeopleSpaceSetup";
import { RoutinesSpaceSetup } from "@/spaces/routines/RoutinesSpaceSetup";
import { SystemSpaceSetup } from "@/spaces/system/SystemSpaceSetup";
import { TasksSpaceSetup } from "@/spaces/tasks/TasksSpaceSetup";
import { Notu, Space } from "notu";
import { useState } from "react";
import { Input, YStack } from "tamagui";
import { NotuRenderTools } from "../helpers/NotuRenderTools";
import { NotuSelect } from "./NotuSelect";


const spaceSetupFunctions = new Map<string, (notu: Notu) => Promise<void>>();
spaceSetupFunctions.set('com.decoyspace.notu.system', notu => SystemSpaceSetup.setup(notu));
spaceSetupFunctions.set('com.decoyspace.notu.calendar', notu => CalendarSpaceSetup.setup(notu));
spaceSetupFunctions.set('com.decoyspace.notu.common', notu => CommonSpaceSetup.setup(notu));
spaceSetupFunctions.set('com.decoyspace.notu.content', notu => ContentSpaceSetup.setup(notu));
spaceSetupFunctions.set('com.decoyspace.notu.fitness', notu => FitnessSpaceSetup.setup(notu));
spaceSetupFunctions.set('com.decoyspace.notu.food', notu => FoodSpaceSetup.setup(notu));
spaceSetupFunctions.set('com.decoyspace.notu.money', notu => MoneySpaceSetup.setup(notu));
spaceSetupFunctions.set('com.decoyspace.notu.people', notu => PeopleSpaceSetup.setup(notu));
spaceSetupFunctions.set('com.decoyspace.notu.routines', notu => RoutinesSpaceSetup.setup(notu));
spaceSetupFunctions.set('com.decoyspace.notu.tasks', notu => TasksSpaceSetup.setup(notu));

const spaceNameMap = {
    'com.decoyspace.notu.system': 'System',
    'com.decoyspace.notu.calendar': 'Calendar',
    'com.decoyspace.notu.common': 'Common',
    'com.decoyspace.notu.content': 'Content',
    'com.decoyspace.notu.fitness': 'Fitness',
    'com.decoyspace.notu.food': 'Food',
    'com.decoyspace.notu.money': 'Money',
    'com.decoyspace.notu.people': 'People',
    'com.decoyspace.notu.routines': 'Routines',
    'com.decoyspace.notu.tasks': 'Tasks'
};

const spaceDependencies = {
    'com.decoyspace.notu.system': [],
    'com.decoyspace.notu.calendar': ['com.decoyspace.notu.system', 'com.decoyspace.notu.common'],
    'com.decoyspace.notu.common': ['com.decoyspace.notu.system'],
    'com.decoyspace.notu.content': ['com.decoyspace.notu.system'],
    'com.decoyspace.notu.fitness': ['com.decoyspace.notu.system', 'com.decoyspace.notu.common'],
    'com.decoyspace.notu.food': ['com.decoyspace.notu.system', 'com.decoyspace.notu.common'],
    'com.decoyspace.notu.money': ['com.decoyspace.notu.system', 'com.decoyspace.notu.common'],
    'com.decoyspace.notu.people': ['com.decoyspace.notu.system', 'com.decoyspace.notu.common', 'com.decoyspace.notu.tasks', 'com.decoyspace.notu.calendar'],
    'com.decoyspace.notu.routines': ['com.decoyspace.notu.system', 'com.decoyspace.notu.common'],
    'com.decoyspace.notu.tasks': ['com.decoyspace.notu.system']
};


interface SpaceEditorProps {
    notuRenderTools: NotuRenderTools,
    space: Space,
    onFinished: () => void
}


export default function SpaceEditor({
    notuRenderTools,
    space,
    onFinished
}: SpaceEditorProps) {

    const manualRefresh = useManualRefresh();
    const [error, setError] = useState<string>(null);
    const [isNameChanged, setIsNameChanged] = useState(false);

    function getAvailableTemplateNames(): Array<string> {
        const output = [];
        for (const key of spaceSetupFunctions.keys()) {
            if (!notuRenderTools.notu.getSpaceByInternalName(key))
                output.push(key);
        }
        return output;
    }

    const availableTemplateNames = getAvailableTemplateNames();

    const dependencies = !!space.internalName
        ? spaceDependencies[space.internalName]
        : [];

    function isSpaceDependedOn(): boolean {
        if (!space.internalName)
            return false;
        for (const otherSpace of notuRenderTools.notu.getSpaces().filter(x => !!x.internalName)) {
            for (const dependency of spaceDependencies[otherSpace.internalName] as Array<string>) {
                if (dependency == space.internalName)
                    return true;
            }
        }
        return false;
    }

    function handleTemplateTypeChange(value: string) {
        space.internalName = value;
        if (!isNameChanged && !!space.internalName)
            space.name = spaceNameMap[space.internalName];
        manualRefresh();
    }

    function handleNameChange(value: string) {
        space.name = value;
        if (value == '')
            setIsNameChanged(false);
        setIsNameChanged(!!value);
    }
    
    async function saveSpace(): Promise<void> {
        try {
            await saveSpaceDependencies();
            const isSpaceNew = space.isNew;
            await notuRenderTools.notu.saveSpace(space);
            if (!!space.internalName && isSpaceNew)
                await spaceSetupFunctions.get(space.internalName)(notuRenderTools.notu);
            setError(null);
            onFinished();
            notuRenderTools.updateNoteTagDataComponentFactories();
        }
        catch (err) {
            setError(err.message);
        }
    }

    async function saveSpaceDependencies(): Promise<void> {
        if (!space.internalName || !space.isNew)
            return;
        for (const dependency of dependencies) {
            if (!!notuRenderTools.notu.getSpaceByInternalName(dependency))
                continue;
            const dspace = new Space(spaceNameMap[dependency]).v('0.0.0');
            dspace.internalName = dependency;
            await notuRenderTools.notu.saveSpace(dspace);
            await spaceSetupFunctions.get(dependency)(notuRenderTools.notu);
        }
    }

    async function deleteSpace(): Promise<void> {
        space.delete();
        await notuRenderTools.notu.saveSpace(space);
        onFinished();
    }

    function cancelEdit(): void {
        onFinished();
    }

    return (
        <YStack>
            {!!error && (<NotuText bold danger>{error}</NotuText>)}

            <NotuText bold>Name</NotuText>

            <Input value={space.name} onChangeText={handleNameChange} />

            {space.isNew && availableTemplateNames.length > 0 && (
                <NotuText bold marginTop={10}>Template</NotuText>
            )}

            {space.isNew && availableTemplateNames.length > 0 && (
                <NotuView height="50">
                    <NotuSelect value={space.internalName}
                                options={availableTemplateNames.map(x => ({ name: spaceNameMap[x], value: x }))}
                                onValueChange={handleTemplateTypeChange} />
                </NotuView>
            )}

            {!!space.internalName && (
                <NotuText>
                    <NotuText bold>Dependencies: </NotuText>
                    {(spaceDependencies[space.internalName] as string[]).map(x => spaceNameMap[x]).join(', ')}
                </NotuText>
            )}
            
            <NotuButton onPress={saveSpace} theme="highlight">Save</NotuButton>
            {!space.isNew && !isSpaceDependedOn() && (
                <NotuButton onPress={deleteSpace} theme="danger">Delete</NotuButton>
            )}
            <NotuButton onPress={cancelEdit}>Cancel</NotuButton>
        </YStack>
    )
}