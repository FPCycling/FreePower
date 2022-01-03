<script lang="ts">
    import { recordings, getStats } from '../_stores/recorder';
    import Button from '../../../components/design/buttons/Button.svelte';

    function generateTcxFile() {
        function addNodeTo(parent: Element, name: string, textValue?: string) {
            const node = parent.appendChild(doc.createElement(name));
            if (textValue) {
                node.textContent = textValue.toString();
            }
            return node;
        }

        const doc = document.implementation.createDocument('', '');

        const rootNode = doc.createElement('TrainingCenterDatabase');
        doc.appendChild(rootNode);
        rootNode.setAttribute('xmlns', 'http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2');
        rootNode.setAttribute('xmlns:up2', 'http://www.garmin.com/xmlschemas/UserProfile/v2');
        rootNode.setAttribute('xmlns:ns3', 'http://www.garmin.com/xmlschemas/ActivityExtension/v2');
        rootNode.setAttributeNS(
            'http://www.w3.org/2001/XMLSchema-instance',
            'xsi:schemaLocation',
            [
                'http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2 https://www8.garmin.com/xmlschemas/TrainingCenterDatabasev2.xsd',
                'http://www.garmin.com/xmlschemas/UserProfile/v2 https://www8.garmin.com/xmlschemas/UserProfileExtensionv2.xsd',
                'http://www.garmin.com/xmlschemas/ActivityExtension/v2 https://www8.garmin.com/xmlschemas/ActivityExtensionv2.xsd',
            ].join(' '),
        );

        const activitiesNode = addNodeTo(rootNode, 'Activities');
        const activityNode = addNodeTo(activitiesNode, 'Activity');
        activityNode.setAttribute('Sport', 'Biking');
        addNodeTo(activityNode, 'Id', new Date().toISOString());

        const stats = getStats();

        const lapNode = addNodeTo(activityNode, 'Lap');
        lapNode.setAttribute('StartTime', stats.startTime);
        addNodeTo(lapNode, 'TotalTimeSeconds', String(stats.totalTimeInSeconds));
        addNodeTo(lapNode, 'DistanceMeters', String(stats.totalDistance));
        addNodeTo(lapNode, 'MaximumSpeed', String(stats.maximumSpeed));
        addNodeTo(lapNode, 'Calories', '0');
        addNodeTo(addNodeTo(lapNode, 'AverageHeartRateBpm'), 'Value', String(stats.heartRate.avg));
        addNodeTo(addNodeTo(lapNode, 'MaximumHeartRateBpm'), 'Value', String(stats.heartRate.max));
        addNodeTo(lapNode, 'Intensity', 'Active');
        addNodeTo(lapNode, 'TriggerMethod', 'Manual');

        const trackNode = addNodeTo(lapNode, 'Track');

        for (const record of $recordings) {
            const trackPointNode = addNodeTo(trackNode, 'Trackpoint');
            addNodeTo(trackPointNode, 'Time', record.time);
            if (record.distance !== 0) {
                addNodeTo(trackPointNode, 'DistanceMeters', String(record.distance));
            }
            if (record.heartRate != 0) {
                addNodeTo(addNodeTo(trackPointNode, 'HeartRateBpm'), 'Value', String(record.heartRate));
            }
            if (record.cadence !== 0) {
                addNodeTo(trackPointNode, 'Cadence', String(record.cadence));
            }
            if (record.power !== 0) {
                addNodeTo(
                    addNodeTo(addNodeTo(trackPointNode, 'Extensions'), 'ns3:TPX'),
                    'ns3:Watts',
                    String(record.power),
                );
            }
        }

        return doc;
    }

    function download(content, fileName, contentType) {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([content], { type: contentType }));
        a.download = fileName;
        a.click();
    }

    function exportTcxFile() {
        const doc = generateTcxFile();

        const heading = `<?xml version="1.0" encoding="${doc.characterSet}"?>\n`;

        download(heading + new XMLSerializer().serializeToString(doc), 'test.tcx', 'text/xml');
    }

    $: console.log($recordings);
</script>

<Button on:click={exportTcxFile}>Export</Button>
