export const config = {
  referenceBundleId: "en",
  bundleIds: ["cn", "de", "pt_br"],
  readBundles: async ({ $fs }) => {
    return await Promise.all(
      config.bundleIds.map(async (id) => {
        const file = await $fs.readFile(`./src/nls/${id}.json`);
        const obj = JSON.parse(file);
        return bundleFrom(resourceFrom(obj), id);
      })
    );
  },
  writeBundles: async ({ bundles, $fs }) => {
    await Promise.all(
      bundles.map(async (bundle) => {
        await $fs.writeFile(
          `./src/nls/${bundle.id.name}.json`,
          serializeResource(bundle.resources[0]),
          {
            encoding: "utf8",
          }
        );
      })
    );
  },
};

function serializeResource(resource) {
  const obj = {};
  for (const message of resource.body) {
    obj[message.id.name] = message.pattern.elements[0].value;
  }
  return JSON.stringify(obj, null, 2);
}

function bundleFrom(resource, bundleId) {
  return {
    type: "Bundle",
    id: {
      type: "Identifier",
      name: bundleId,
    },
    resources: [resource],
  };
}

function resourceFrom(obj) {
  return {
    type: "Resource",
    id: { type: "Identifier", name: "default" },
    body: Object.entries(obj).flatMap(([key, value]) => {
      if (typeof value === "string") {
        return messageFrom(key, value);
      } else {
        return Object.entries(value).map(([subkey, subvalue]) =>
          messageFrom(`${key}.${subkey}`, subvalue)
        );
      }
    }),
  };
}

function messageFrom(id, value) {
  return {
    type: "Message",
    id: {
      type: "Identifier",
      name: id,
    },
    pattern: {
      type: "Pattern",
      elements: [{ type: "Text", value }],
    },
  };
}
