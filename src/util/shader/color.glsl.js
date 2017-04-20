module.exports = "@export ecgl.color.vertex\n\nuniform mat4 worldViewProjection : WORLDVIEWPROJECTION;\nuniform vec2 uvRepeat: [1, 1];\n\nattribute vec2 texcoord : TEXCOORD_0;\nattribute vec3 position: POSITION;\n\n@import ecgl.wireframe.common.vertexHeader\n\n#ifdef VERTEX_COLOR\nattribute vec4 a_Color : COLOR;\nvarying vec4 v_Color;\n#endif\n\nvarying vec2 v_Texcoord;\n\nvoid main()\n{\n    gl_Position = worldViewProjection * vec4(position, 1.0);\n    v_Texcoord = texcoord * uvRepeat;\n\n#ifdef VERTEX_COLOR\n    v_Color = a_Color;\n#endif\n\n    @import ecgl.wireframe.common.vertexMain\n\n}\n\n@end\n\n@export ecgl.color.fragment\n\n#define LAYER_DIFFUSEMAP_COUNT 0\n#define LAYER_EMISSIVEMAP_COUNT 0\n\nuniform sampler2D diffuseMap;\nuniform vec4 color : [1.0, 1.0, 1.0, 1.0];\n\n#ifdef VERTEX_COLOR\nvarying vec4 v_Color;\n#endif\n\n#if (LAYER_DIFFUSEMAP_COUNT > 0)\nuniform float layerDiffuseIntensity[LAYER_DIFFUSEMAP_COUNT];\nuniform sampler2D layerDiffuseMap[LAYER_DIFFUSEMAP_COUNT];\n#endif\n\n#if (LAYER_EMISSIVEMAP_COUNT > 0)\nuniform float layerEmissionIntensity[LAYER_EMISSIVEMAP_COUNT];\nuniform sampler2D layerEmissiveMap[LAYER_EMISSIVEMAP_COUNT];\n#endif\n\nvarying vec2 v_Texcoord;\n\n@import ecgl.wireframe.common.fragmentHeader\n\n@import qtek.util.srgb\n\nvoid main()\n{\n#ifdef SRGB_DECODE\n    gl_FragColor = sRGBToLinear(color);\n#else\n    gl_FragColor = color;\n#endif\n\n#ifdef VERTEX_COLOR\n    gl_FragColor *= v_Color;\n#endif\n\n    vec4 albedoTexel = vec4(1.0);\n#ifdef DIFFUSEMAP_ENABLED\n    albedoTexel = texture2D(diffuseMap, v_Texcoord);\n    #ifdef SRGB_DECODE\n    albedoTexel = sRGBToLinear(albedoTexel);\n    #endif\n#endif\n\n#if (LAYER_DIFFUSEMAP_COUNT > 0)\n    for (int _idx_ = 0; _idx_ < LAYER_DIFFUSEMAP_COUNT; _idx_++) {{\n        float intensity = layerDiffuseIntensity[_idx_];\n        vec4 texel2 = texture2D(layerDiffuseMap[_idx_], v_Texcoord);\n        #ifdef SRGB_DECODE\n        texel2 = sRGBToLinear(texel2);\n        #endif\n                albedoTexel.rgb = mix(albedoTexel.rgb, texel2.rgb * intensity, texel2.a);\n        albedoTexel.a = texel2.a + (1.0 - texel2.a) * albedoTexel.a;\n    }}\n#endif\n    gl_FragColor *= albedoTexel;\n\n#if (LAYER_EMISSIVEMAP_COUNT > 0)\n    for (int _idx_ = 0; _idx_ < LAYER_EMISSIVEMAP_COUNT; _idx_++) {{\n                vec4 texel2 = texture2D(layerEmissiveMap[_idx_], v_Texcoord);\n        float intensity = layerEmissionIntensity[_idx_];\n        gl_FragColor.rgb += texel2.rgb * texel2.a * intensity;\n    }}\n#endif\n\n\n    @import ecgl.wireframe.common.fragmentMain\n\n}\n@end";